import { currentUser } from '@/lib/auth'
import { q } from '@/lib/db'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  const { id } = await params
  if (!user || !/^\d+$/.test(id)) return new Response(null, { status: 404 })
  const [a] = await q<{ mime: string; data: Buffer }>('select mime,data from assets where id=$1 and user_id=$2', [id, user.id])
  if (!a || !['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(a.mime)) return new Response(null, { status: 404 })
  return new Response(new Uint8Array(a.data), { headers: { 'Content-Type': a.mime, 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff', ...(new URL(req.url).searchParams.has('download') ? { 'Content-Disposition': `attachment; filename="archivo.${a.mime === 'video/mp4' ? 'mp4' : a.mime === 'video/webm' ? 'webm' : a.mime === 'image/webp' ? 'webp' : a.mime === 'image/png' ? 'png' : 'jpg'}"` } : {}) } })
}
