import { requireUser } from '@/lib/auth'
import { q } from '@/lib/db'
import { STEP_IDS, STEPS, WEEKS } from '@/lib/ecommerce'

export default async function Products({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser()
  const products = await q('select id,name,data from products where user_id=$1 order by updated_at desc', [user.id])
  const { error } = await searchParams
  const done = (p: { data: { done?: number[] } }) => (p.data.done || []).filter(n => STEP_IDS.has(n)).length
  return <><span className="eyebrow">DE LA IDEA A TU PRIMERA VENTA</span><h1>Mi ruta ecommerce</h1><p className="muted">Un espacio por producto. Nueve pasos en 4 semanas para preparar, vender y comprar tu primer cajón.</p>
    <div className="journey-overview">{WEEKS.map(([w, name]) => <span key={w}><b>S{w}</b>{name}</span>)}</div>
    {error && <p className="err">Escribe un nombre y usa enlaces completos con http o https.</p>}
    <form className="form" method="post" action="/api/products"><h2>Comienza con un producto</h2><div className="row"><div><label htmlFor="name">Nombre del producto</label><input id="name" name="name" required maxLength={120} placeholder="Ej. Termo de acero" /></div><div><label htmlFor="reference">Video o página de referencia (opcional)</label><input id="reference" name="reference" type="url" placeholder="https://…" /></div></div><button>Crear mi ruta ↗</button></form>
    <div className="product-library">{products.map(p => <a className="card" key={p.id} href={`/panel/products/${p.id}`}><span className="product-symbol" aria-hidden="true">◇</span><h3>{p.name}</h3><p>{done(p)} de {STEPS.length} pasos completados</p><div className="bar"><i style={{ width: `${done(p) / STEPS.length * 100}%` }} /></div><b>Continuar mi producto ↗</b></a>)}</div>
    {!products.length && <p className="muted">Tu biblioteca está lista. Crea tu primer producto para guardar su contenido y avances.</p>}
  </>
}
