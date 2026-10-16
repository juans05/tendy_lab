import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { money } from '@/lib/meta'
import { OrderBrand } from '@/lib/order-brand'
import { HEX, readableOn } from '@/lib/landing-prompt'
export const dynamic = 'force-dynamic'
// photos (bytea) no se lee aquí: solo cuántas hay; cada foto se sirve por /api/order-links/[token]/photo/[i].
const load = (token: string) => q('select l.token,l.product_name,l.price,l.currency,l.active,l.page,coalesce(array_length(l.photos,1),0) as n_photos,l.video is not null as has_video,u.brand,exists(select 1 from brand_logos b where b.user_id=l.user_id) as has_logo from order_links l join users u on u.id=l.user_id where l.token=$1', [token])
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [link] = /^[a-f0-9]{48}$/.test(token) ? await load(token) : []
  return { title: link?.page ? `${link.product_name} · ${link.brand.name}` : 'Solicitar pedido', description: link?.page?.subheadline, robots: { index: false, follow: false } }
}
export default async function Order({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ receipt?: string; e?: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{48}$/.test(token)) notFound()
  const [link] = await load(token)
  if (!link) notFound()
  const { receipt, e } = await searchParams
  const confirmed = receipt && /^[a-f0-9]{48}$/.test(receipt) && (await q('select id from customer_orders where receipt=$1 and link_token=$2', [receipt, token])).length > 0
  const p = link.active ? link.page : null
  const photos = Array.from({ length: p ? link.n_photos : 0 }, (_, i) => `/api/order-links/${token}/photo/${i}`)
  const wa = p?.whatsapp && `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(`Hola ${link.brand.name}, me interesa ${link.product_name}`)}`
  const price = money(Number(link.price), link.currency)
  const form = <section className="form" id="pedir"><span className="eyebrow">TU PEDIDO, EN UN PASO</span><h1>{p ? 'Haz tu pedido' : link.product_name}</h1><p className="order-price">{price} <small>por unidad</small></p>
    {confirmed ? <div className="ok"><h2>¡Recibimos tu pedido!</h2><p>{link.brand.name} te contactará para confirmar disponibilidad, entrega y pago.</p></div> : !link.active ? <p className="note">Este enlace ya no recibe pedidos.</p> : <><p>Completa tus datos para solicitar tu pedido. No necesitas crear una cuenta.</p>{e && <p className="err">{e === 'invalid' ? 'Revisa tu nombre, teléfono, dirección y cantidad.' : 'No pudimos recibir el pedido. Inténtalo en un minuto.'}</p>}<form method="post" action="/api/orders"><input type="hidden" name="token" value={token} /><div className="sr-only" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div><label htmlFor="customer_name">Tu nombre</label><input id="customer_name" name="customer_name" autoComplete="name" required minLength={2} maxLength={120} /><label htmlFor="phone">WhatsApp o teléfono</label><input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={25} /><label htmlFor="address">Dirección o zona de entrega</label><textarea id="address" name="address" autoComplete="street-address" required minLength={5} maxLength={500} rows={3} /><label htmlFor="quantity">¿Cuántas unidades quieres?</label><input id="quantity" name="quantity" type="number" min="1" max="100" defaultValue="1" required /><p className="tag">El envío se coordina por separado. Tus datos serán usados por {link.brand.name} para gestionar este pedido.</p><button>Solicitar mi pedido ↗</button></form></>}
  </section>
  // Colores de marca elegidos en la MiniApp (validados como #rrggbb al guardarse).
  const theme: any = p && {
    ...(HEX.test(p.color_primary ?? '') && { '--orange': p.color_primary, '--orange-dark': p.color_primary, '--on-primary': readableOn(p.color_primary) }),
    ...(HEX.test(p.color_accent ?? '') && readableOn(p.color_accent) === '#ffffff' && { '--navy': p.color_accent }), // acento claro no se lee sobre crema: queda el azul de Tendy
  }
  return <main className={p ? 'public-order product-page' : 'public-order'} style={theme}><OrderBrand name={link.brand.name} src={link.has_logo ? `/api/order-links/${token}/logo` : undefined} />
    {p && !confirmed && <>
      <section className="pp-hero">
        {photos[0] ? <img className="pp-main" src={photos[0]} alt={link.product_name} /> : link.has_video && <video className="pp-main" src={`/api/order-links/${token}/video`} controls muted loop playsInline autoPlay />}
        <span className="eyebrow">{link.product_name}</span><h1>{p.headline}</h1><p className="pp-sub">{p.subheadline}</p>
        <p className="order-price">{price}</p>
        <div className="pp-actions"><a className="btn lg" href="#pedir">{p.cta} ↓</a>{wa && <a className="btn lg ghost pp-wa" href={wa} target="_blank" rel="noopener">💬 Escríbenos por WhatsApp</a>}</div>
      </section>
      {photos[0] && link.has_video && <video className="pp-main" src={`/api/order-links/${token}/video`} controls muted loop playsInline preload="metadata" />}
      {photos.length > 1 && <div className="pp-gallery">{photos.slice(1).map((src, i) => <img key={src} src={src} alt={`${link.product_name}, foto ${i + 2}`} loading="lazy" />)}</div>}
      <section className="pp-benefits"><h2>¿Por qué te va a encantar?</h2>{p.benefits.map((b: any, i: number) => <article key={i}><span aria-hidden="true">✦</span><div><h3>{b.title}</h3><p>{b.text}</p></div></article>)}</section>
      {p.faqs.length > 0 && <section className="pp-faqs"><h2>Preguntas frecuentes</h2>{p.faqs.map((f: any, i: number) => <details key={i}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>}
    </>}
    {form}
    {wa && <a className="pp-wa-float" href={wa} target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">💬</a>}
    <p className="tag">{p ? 'Página creada' : 'Pedidos'} con TendyLab Tools</p></main>
}
