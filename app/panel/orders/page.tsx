import { requireUser } from '@/lib/auth'
import { q } from '@/lib/db'
import { money } from '@/lib/meta'
import { OrderLink } from '@/lib/order-link'
import { OrderBrand } from '@/lib/order-brand'
export default async function Orders({ searchParams }: { searchParams: Promise<{ e?: string; created?: string; logo?: string }> }) {
  const user = await requireUser()
  const { e, created, logo } = await searchParams
  const [brandLogo] = await q('select updated_at from brand_logos where user_id=$1', [user.id])
  const links = await q('select * from order_links where user_id=$1 order by created_at desc', [user.id])
  const orders = await q('select o.*,l.product_name,l.currency from customer_orders o join order_links l on l.token=o.link_token where l.user_id=$1 order by o.id desc limit 100', [user.id])
  return <><span className="eyebrow">DE INTERESADO A PEDIDO</span><h1>Mi enlace de pedidos</h1><p className="muted">Comparte un formulario y recibe los pedidos de tus clientes aquí.</p>
    <div className="note">Marca: <b>{user.brand.name || 'Por completar'}</b> · Moneda: <b>{user.brand.currency || 'Por completar'}</b>. <a href="/panel/brand">Editar Mi marca</a></div>
    <section className="card order-logo-settings"><div><h2>El logo de tus pedidos</h2><p className="tag">Se muestra en todos tus enlaces. Si no agregas uno, aparece el logo de Tendy.</p><OrderBrand name={user.brand.name || 'Tu marca'} src={brandLogo ? `/api/brand/logo?v=${new Date(brandLogo.updated_at).getTime()}` : undefined} /></div><div>
      {logo === 'error' && <p className="err">Elige una imagen JPG, PNG o WEBP de hasta 2 MB.</p>}{logo === 'saved' && <p className="ok" role="status">Logo actualizado.</p>}
      <form method="post" action="/api/brand/logo" encType="multipart/form-data"><label htmlFor="brand-logo">Subir logo de Mi marca</label><input id="brand-logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp" required /><p className="tag">JPG, PNG o WEBP · Hasta 2 MB. PNG o WEBP permiten fondo transparente.</p><button>{brandLogo ? 'Cambiar logo' : 'Guardar logo'}</button></form>
      {brandLogo && <form method="post" action="/api/brand/logo"><input type="hidden" name="remove" value="1" /><button className="link">Usar logo de Tendy</button></form>}
    </div></section>
    {e && <p className="err">{e === 'brand' ? 'Completa el nombre y la moneda en Mi marca antes de crear un enlace.' : 'Revisa el producto y su precio.'}</p>}{created && <p className="ok">Enlace creado. Ya puedes copiarlo.</p>}
    <form className="form" method="post" action="/api/order-links"><h2>Crea un enlace para un producto</h2><div className="row"><div><label htmlFor="product_name">Producto</label><input id="product_name" name="product_name" required maxLength={120} /></div><div><label htmlFor="price">Precio por unidad ({user.brand.currency || 'moneda de Mi marca'})</label><input id="price" name="price" type="number" step="0.01" min="0.01" max="1000000" required /></div></div><button>Crear enlace ↗</button></form>
    {links.map(l => <section className="card" key={l.token}><h3>{l.product_name}</h3><p>{money(Number(l.price), l.currency)} · {l.active ? 'Enlace activo' : 'Desactivado'}</p>{l.active && <><OrderLink token={l.token} /><form method="post" action="/api/order-links"><input type="hidden" name="token" value={l.token} /><button className="link">Desactivar enlace</button></form></>}</section>)}
    <h2>Pedidos recibidos</h2>{!orders.length ? <div className="card">Aún no hay pedidos. Comparte un enlace para empezar.</div> : <div className="scroll"><table><thead><tr><th>Cliente</th><th>Pedido</th><th>Entrega</th><th>Estado</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td><b>{o.customer_name}</b><br />{o.phone}</td><td>{o.quantity} × {o.product_name}<br />{money(Number(o.unit_price) * o.quantity, o.currency)}</td><td>{o.address}</td><td><form method="post" action="/api/orders"><input type="hidden" name="order_id" value={o.id} /><select name="status" defaultValue={o.status} aria-label={`Estado del pedido ${o.id}`}>{['Nuevo', 'Contactado', 'Confirmado', 'Entregado', 'Cancelado'].map(s => <option key={s}>{s}</option>)}</select><button>Guardar</button></form></td></tr>)}</tbody></table></div>}
    <p className="tag">El formulario registra una solicitud. No cobra ni confirma stock o entrega automáticamente.</p>
  </>
}
