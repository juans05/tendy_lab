import sharp from 'sharp'
import { currentUser } from '@/lib/auth'
import { q } from '@/lib/db'

const EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'image/png': 'png', 'image/jpeg': 'jpg' }

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  const { id } = await params
  if (!user || !/^\d+$/.test(id)) return new Response(null, { status: 404 })
  const [a] = await q<{ mime: string; data: Buffer }>('select mime,data from assets where id=$1 and user_id=$2', [id, user.id])
  if (!a || !['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(a.mime)) return new Response(null, { status: 404 })
  const download = new URL(req.url).searchParams.has('download')
  // WEBP se guarda por tamaño, pero se descarga en PNG: abre en cualquier app y conserva la transparencia.
  const [mime, data] = download && a.mime === 'image/webp' ? ['image/png', await sharp(a.data).png().toBuffer()] : [a.mime, a.data]
  return new Response(new Uint8Array(data), { headers: { 'Content-Type': mime, 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff', ...(download ? { 'Content-Disposition': `attachment; filename="tendylab-${id}.${EXT[mime]}"` } : {}) } })
}
