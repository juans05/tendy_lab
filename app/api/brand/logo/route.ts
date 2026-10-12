import sharp from 'sharp'
import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'

export async function GET() {
  const user = await currentUser()
  if (!user) return new Response(null, { status: 401 })
  const [logo] = await q('select data from brand_logos where user_id=$1', [user.id])
  if (!logo) return new Response(null, { status: 404 })
  return new Response(new Uint8Array(logo.data), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return go('/login')
  const f = await req.formData()
  if (f.get('remove') === '1') {
    await q('delete from brand_logos where user_id=$1', [user.id])
    return go('/panel/orders?logo=saved')
  }
  const file = f.get('logo')
  if (!(file instanceof File) || !file.size || file.size > 2 * 1024 * 1024) return go('/panel/orders?logo=error')
  try {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16000000 })
    const metadata = await source.metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) return go('/panel/orders?logo=error')
    const data = await source.rotate().resize({ width: 600, height: 300, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toBuffer()
    await q('insert into brand_logos(user_id,data) values($1,$2) on conflict(user_id) do update set data=excluded.data,updated_at=now()', [user.id, data])
    return go('/panel/orders?logo=saved')
  } catch {
    return go('/panel/orders?logo=error')
  }
}
