import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'
import { PRODUCT_FIELDS, safeWebUrl, STEP_IDS } from '@/lib/ecommerce'

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return go('/login')
  const f = await req.formData()
  const name = String(f.get('name') || '').trim().slice(0, 120)
  const id = String(f.get('id') || '')
  if (!name || (id && !/^\d+$/.test(id))) return go('/panel/products?error=1')
  const data: Record<string, unknown> = {}
  for (const field of PRODUCT_FIELDS) data[field] = String(f.get(field) || '').trim().slice(0, 5000)
  for (const field of ['reference', 'post_url']) if (data[field] && !safeWebUrl(String(data[field]))) return go(id ? `/panel/products/${id}?error=1` : '/panel/products?error=1')
  data.done = [...new Set(f.getAll('done').map(Number).filter(n => STEP_IDS.has(n)))]
  if (id) {
    const rows = await q('update products set name=$3,data=$4,updated_at=now() where id=$1 and user_id=$2 returning id', [id, user.id, name, data])
    if (!rows.length) return new Response('No encontrado', { status: 404 })
  } else {
    const [row] = await q('insert into products(user_id,name,data) values($1,$2,$3) returning id', [user.id, name, data])
    return go(`/panel/products/${row.id}?saved=1`)
  }
  return go(`/panel/products/${id}?saved=1`)
}
