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
  if (token && f.get('action') === 'page') { // editar textos de la Página de producto
    const back = (ok: boolean) => go(`/panel/runs/${String(f.get('run')).replace(/\D/g, '')}?saved=${ok ? 1 : 0}`)
    const pairs = (v: FormDataEntryValue | null) => String(v || '').split('\n').map(l => l.split('|')).filter(p => p[0].trim()).map(([a, ...b]) => [a.trim(), b.join('|').trim()])
    const whatsapp = String(f.get('whatsapp') || '').replace(/\D/g, '')
    const page = z.object({
      headline: z.string().trim().min(3).max(90), subheadline: z.string().trim().min(3).max(220), cta: z.string().trim().min(2).max(40),
      benefits: z.array(z.object({ title: z.string().min(1).max(60), text: z.string().min(1).max(260) })).min(1).max(6),
      faqs: z.array(z.object({ q: z.string().min(1).max(140), a: z.string().min(1).max(400) })).max(8),
      whatsapp: z.string().refine(w => !w || (w.length >= 8 && w.length <= 15)),
    }).safeParse({ headline: f.get('headline'), subheadline: f.get('subheadline'), cta: f.get('cta'), whatsapp,
      benefits: pairs(f.get('benefits')).map(([title, text]) => ({ title, text })), faqs: pairs(f.get('faqs')).map(([q, a]) => ({ q, a })) })
    if (!page.success) return back(false)
    await q('update order_links set page=$3 where token=$1 and user_id=$2 and page is not null', [token, user.id, page.data])
    return back(true)
  }
  if (token) {
    await q('update order_links set active=false where token=$1 and user_id=$2', [token, user.id])
    return go('/panel/orders')
  }
  const parsed = z.object({ product_name: z.string().trim().min(1).max(120), price: z.coerce.number().positive().max(1000000) }).safeParse(Object.fromEntries(f))
  if (!parsed.success) return go('/panel/orders?e=invalid')
  await q('insert into order_links(token,user_id,product_name,price,currency) values($1,$2,$3,$4,$5)', [randomBytes(24).toString('hex'), user.id, parsed.data.product_name, Math.max(1, Math.round(parsed.data.price * 100)), user.brand.currency])
  return go('/panel/orders?created=1')
}
