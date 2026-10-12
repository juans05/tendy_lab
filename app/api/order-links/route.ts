import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return go('/login')
  if (!user.brand.name || !user.brand.currency) return go('/panel/orders?e=brand')
  const f = await req.formData()
  const token = String(f.get('token') || '')
  if (token) {
    await q('update order_links set active=false where token=$1 and user_id=$2', [token, user.id])
    return go('/panel/orders')
  }
  const parsed = z.object({ product_name: z.string().trim().min(1).max(120), price: z.coerce.number().positive().max(1000000) }).safeParse(Object.fromEntries(f))
  if (!parsed.success) return go('/panel/orders?e=invalid')
  await q('insert into order_links(token,user_id,product_name,price,currency) values($1,$2,$3,$4,$5)', [randomBytes(24).toString('hex'), user.id, parsed.data.product_name, Math.max(1, Math.round(parsed.data.price * 100)), user.brand.currency])
  return go('/panel/orders?created=1')
}
