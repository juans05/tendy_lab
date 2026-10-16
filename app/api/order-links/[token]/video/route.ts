import { q } from '@/lib/db'
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response(null, { status: 404 })
  const [row] = await q('select video,video_mime from order_links where token=$1 and active and video is not null', [token])
  if (!row) return new Response(null, { status: 404 })
  // ponytail: sin Range; si Safari falla al adelantar el video, servir por rangos o mover a R2.
  return new Response(new Uint8Array(row.video), { headers: { 'Content-Type': row.video_mime, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } })
}
