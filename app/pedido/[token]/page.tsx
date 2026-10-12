import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { money } from '@/lib/meta'
import { OrderBrand } from '@/lib/order-brand'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Solicitar pedido', robots: { index: false, follow: false } }
export default async function Order({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ receipt?: string; e?: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{48}$/.test(token)) notFound()
  const [link] = await q('select l.*,u.brand,exists(select 1 from brand_logos b where b.user_id=l.user_id) as has_logo from order_links l join users u on u.id=l.user_id where l.token=$1', [token])
  if (!link) notFound()
  const { receipt, e } = await searchParams
  const confirmed = receipt && /^[a-f0-9]{48}$/.test(receipt) && (await q('select id from customer_orders where receipt=$1 and link_token=$2', [receipt, token])).length > 0
  return <main className="public-order"><OrderBrand name={link.brand.name} src={link.has_logo ? `/api/order-links/${token}/logo` : undefined} /><section className="form"><span className="eyebrow">TU PEDIDO, EN UN PASO</span><h1>{link.product_name}</h1><p className="order-price">{money(Number(link.price), link.currency)} <small>por unidad</small></p>
    {confirmed ? <div className="ok"><h2>¡Recibimos tu pedido!</h2><p>{link.brand.name} te contactará para confirmar disponibilidad, entrega y pago.</p></div> : !link.active ? <p className="note">Este enlace ya no recibe pedidos.</p> : <><p>Completa tus datos para solicitar tu pedido. No necesitas crear una cuenta.</p>{e && <p className="err">{e === 'invalid' ? 'Revisa tu nombre, teléfono, dirección y cantidad.' : 'No pudimos recibir el pedido. Inténtalo en un minuto.'}</p>}<form method="post" action="/api/orders"><input type="hidden" name="token" value={token} /><div className="sr-only" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div><label htmlFor="customer_name">Tu nombre</label><input id="customer_name" name="customer_name" autoComplete="name" required minLength={2} maxLength={120} /><label htmlFor="phone">WhatsApp o teléfono</label><input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={25} /><label htmlFor="address">Dirección o zona de entrega</label><textarea id="address" name="address" autoComplete="street-address" required minLength={5} maxLength={500} rows={3} /><label htmlFor="quantity">¿Cuántas unidades quieres?</label><input id="quantity" name="quantity" type="number" min="1" max="100" defaultValue="1" required /><p className="tag">El envío se coordina por separado. Tus datos serán usados por {link.brand.name} para gestionar este pedido.</p><button>Solicitar mi pedido ↗</button></form></>}
  </section><p className="tag">Pedidos con TendyLab Tools</p></main>
}
