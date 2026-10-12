import { q } from '@/lib/db'
export async function GET(_req: Request, { params }: { params: Promise<{ token: string; i: string }> }) {
  const { token, i } = await params
  if (!/^[a-f0-9]{48}$/.test(token) || !/^[0-4]$/.test(i)) return new Response(null, { status: 404 })
  const [row] = await q('select photos[$2::int + 1] as data from order_links where token=$1 and active', [token, i])
  if (!row?.data) return new Response(null, { status: 404 })
  return new Response(new Uint8Array(row.data), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } })
}
