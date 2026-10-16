import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = promisify(execFile)
const FFMPEG = () => process.env.FFMPEG_PATH || 'ffmpeg'
const FFPROBE = () => (process.env.FFMPEG_PATH ? process.env.FFMPEG_PATH.replace(/ffmpeg(\.exe)?$/, 'ffprobe$1') : 'ffprobe')
const MAX_FRAMES = 12

export type VideoPrep = { duration: number; frames: { t: number; b64: string }[]; audio_b64: string | null; has_video: boolean }
// 90 → "90 s", 300 → "5 minutos"
export const durationLabel = (s: number) => (s % 60 || s < 120 ? `${s} s` : `${s / 60} minutos`)

// Valida con ffprobe, extrae ~12 frames y el audio en mp3 (Gemini lo escucha directo, sin transcribir aparte).
// allowAudio: acepta archivos solo de audio (notas de voz); no hay frames.
export async function prepareVideo(data: Buffer, { maxSeconds = 90, allowAudio = false } = {}): Promise<VideoPrep> {
  const dir = await mkdtemp(join(tmpdir(), 'tl-'))
  try {
    const src = join(dir, 'in')
    await writeFile(src, data)
    const probe = await run(FFPROBE(), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type:stream_disposition=attached_pic', '-of', 'json', src], { timeout: 30000 })
      .catch(() => { throw new Error(allowAudio ? 'El archivo está dañado o no es un audio o video válido' : 'El archivo de video está dañado o no es un video válido') })
    const info = JSON.parse(probe.stdout)
    const duration = Number(info.format?.duration)
    const has_video = !!info.streams?.some((s: any) => s.codec_type === 'video' && !s.disposition?.attached_pic) // la carátula de un mp3/m4a no es video
    if (!duration || (!has_video && !allowAudio)) throw new Error('El archivo no contiene video')
    if (duration > maxSeconds + 5) throw new Error(`El archivo dura ${Math.round(duration)} s; el máximo es ${durationLabel(maxSeconds)}`) // +5 s de tolerancia
    if (!has_video) return { duration, frames: [], audio_b64: await extractAudio(dir, src, info), has_video }

    const n = Math.min(MAX_FRAMES, Math.max(3, Math.ceil(duration)))
    await run(FFMPEG(), ['-v', 'error', '-i', src, '-vf', `fps=${n / duration},scale='min(640,iw)':-2`, '-frames:v', String(n), '-q:v', '6', join(dir, 'f%02d.jpg')], { timeout: 120000 })
    const names = (await readdir(dir)).filter(f => f.startsWith('f')).sort()
    const frames = await Promise.all(names.map(async (f, i) => ({
      t: Math.round(((i + 0.5) * duration) / names.length * 10) / 10,
      b64: (await readFile(join(dir, f))).toString('base64'),
    })))

    return { duration, frames, audio_b64: await extractAudio(dir, src, info), has_video }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function extractAudio(dir: string, src: string, info: any) {
  if (!info.streams?.some((s: any) => s.codec_type === 'audio')) return null
  const audio = join(dir, 'a.mp3')
  await run(FFMPEG(), ['-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '32k', audio], { timeout: 120000 })
  return (await readFile(audio)).toString('base64')
}
