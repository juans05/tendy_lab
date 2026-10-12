import { q } from '@/lib/db'
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response(null, { status: 404 })
  const [logo] = await q('select b.data from brand_logos b join order_links l on l.user_id=b.user_id where l.token=$1', [token])
  if (!logo) return new Response(null, { status: 404 })
  return new Response(new Uint8Array(logo.data), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}
