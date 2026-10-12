import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = promisify(execFile)
const FFMPEG = () => process.env.FFMPEG_PATH || 'ffmpeg'
const FFPROBE = () => (process.env.FFMPEG_PATH ? process.env.FFMPEG_PATH.replace(/ffmpeg(\.exe)?$/, 'ffprobe$1') : 'ffprobe')
export const MAX_SECONDS = 95 // límite funcional 90 s + tolerancia
const MAX_FRAMES = 12

export type VideoPrep = { duration: number; frames: { t: number; b64: string }[]; audio_b64: string | null }

// Valida con ffprobe, extrae ~12 frames y el audio en mp3 (Gemini lo escucha directo, sin transcribir aparte).
export async function prepareVideo(data: Buffer): Promise<VideoPrep> {
  const dir = await mkdtemp(join(tmpdir(), 'tl-'))
  try {
    const src = join(dir, 'in')
    await writeFile(src, data)
    const probe = await run(FFPROBE(), ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', src], { timeout: 30000 })
      .catch(() => { throw new Error('El archivo de video está dañado o no es un video válido') })
    const info = JSON.parse(probe.stdout)
    const duration = Number(info.format?.duration)
    if (!duration || !info.streams?.some((s: any) => s.codec_type === 'video')) throw new Error('El archivo no contiene video')
    if (duration > MAX_SECONDS) throw new Error(`El video dura ${Math.round(duration)} s; el máximo es 90 s`)

    const n = Math.min(MAX_FRAMES, Math.max(3, Math.ceil(duration)))
    await run(FFMPEG(), ['-v', 'error', '-i', src, '-vf', `fps=${n / duration},scale='min(640,iw)':-2`, '-frames:v', String(n), '-q:v', '6', join(dir, 'f%02d.jpg')], { timeout: 120000 })
    const names = (await readdir(dir)).filter(f => f.startsWith('f')).sort()
    const frames = await Promise.all(names.map(async (f, i) => ({
      t: Math.round(((i + 0.5) * duration) / names.length * 10) / 10,
      b64: (await readFile(join(dir, f))).toString('base64'),
    })))

    let audio_b64: string | null = null
    if (info.streams.some((s: any) => s.codec_type === 'audio')) {
      const audio = join(dir, 'a.mp3')
      await run(FFMPEG(), ['-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '32k', audio], { timeout: 120000 })
      audio_b64 = (await readFile(audio)).toString('base64')
    }
    return { duration, frames, audio_b64 }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
