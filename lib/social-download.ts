import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
export function socialUrl(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Enlace inválido')
  if (!['www.tiktok.com', 'tiktok.com', 'www.instagram.com', 'instagram.com'].includes(url.hostname)) throw new Error('Usa un enlace de TikTok o Instagram')
  if (!(url.hostname.includes('tiktok') ? /^\/@[^/]+\/video\/\d+\/?$/ : /^\/(reels?|p|tv)\/[A-Za-z0-9_-]+\/?$/).test(url.pathname)) throw new Error('Usa el enlace completo de una publicación')
  url.search = ''; url.hash = ''
  return url.href
}
export async function downloadSocial(value: string) {
  const url = socialUrl(value)
  if (!process.env.YTDLP_PATH) throw new Error('La descarga por enlace no está configurada. Sube el archivo de video.')
  const dir = await mkdtemp(join(tmpdir(), 'tendy-download-'))
  try {
    await promisify(execFile)(process.env.YTDLP_PATH, ['--ignore-config', '--no-playlist', '--max-filesize', '100M', '--socket-timeout', '20', '--retries', '1', '-f', 'best[ext=mp4]', '-o', join(dir, 'video.%(ext)s'), '--', url], { timeout: 120000, maxBuffer: 1024 * 1024 })
    const name = (await readdir(dir)).find(n => n === 'video.mp4')
    if (!name || (await stat(join(dir, name))).size > 100 * 1024 * 1024) throw new Error('Archivo no válido')
    return await readFile(join(dir, name))
  } catch { throw new Error('No pudimos descargar esta publicación. Sube el archivo del video para continuar.') }
  finally { await rm(dir, { recursive: true, force: true }) }
}
