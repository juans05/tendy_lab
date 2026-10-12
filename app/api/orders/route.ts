import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { currentUser, go } from '@/lib/auth'
import { q, tx } from '@/lib/db'
export async function POST(req: Request) {
  const f = await req.formData()
  if (f.get('order_id')) {
    const user = await currentUser()
    if (!user) return go('/login')
    const status = String(f.get('status'))
    if (!['Nuevo', 'Contactado', 'Confirmado', 'Entregado', 'Cancelado'].includes(status)) return new Response('Estado inválido', { status: 400 })
    await q('update customer_orders o set status=$3 from order_links l where o.link_token=l.token and o.id=$1 and l.user_id=$2', [String(f.get('order_id')), user.id, status])
    return go('/panel/orders')
  }
  const token = String(f.get('token') || '')
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response('No encontrado', { status: 404 })
  const parsed = z.object({ customer_name: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(25).regex(/^[+\d ()-]+$/), address: z.string().trim().min(5).max(500), quantity: z.coerce.number().int().min(1).max(100) }).safeParse(Object.fromEntries(f))
  if (!parsed.success || f.get('website')) return go(`/pedido/${token}?e=invalid`)
  const receipt = randomBytes(24).toString('hex')
  const saved = await tx(async c => {
    const { rows: [link] } = await c.query('select token,price,currency,active from order_links where token=$1 and active=true for update', [token])
    if (!link) return false
    const { rows: [count] } = await c.query("select count(*)::int n from customer_orders where link_token=$1 and created_at>now()-interval '1 minute'", [token])
    if (count.n >= 10) return false
    const p = parsed.data
    await c.query('insert into customer_orders(link_token,customer_name,phone,address,quantity,unit_price,receipt) values($1,$2,$3,$4,$5,$6,$7)', [token, p.customer_name, p.phone, p.address, p.quantity, link.price, receipt])
    return true
  })
  return go(saved ? `/pedido/${token}?receipt=${receipt}` : `/pedido/${token}?e=unavailable`)
}
