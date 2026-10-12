import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { q } from '@/lib/db'
import { safeWebUrl, STEPS, WEEKS } from '@/lib/ecommerce'
import { GUIDES } from '@/lib/guides'
import { CopyText } from '@/lib/copy-text'

export default async function Product({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [p] = await q('select * from products where id=$1 and user_id=$2', [id, user.id])
  if (!p) notFound()
  const d = p.data
  const { saved, error } = await searchParams
  const field = (key: string, label: string, placeholder = '') => <div><label htmlFor={key}>{label}</label><textarea id={key} name={key} defaultValue={d[key] || ''} maxLength={5000} rows={3} placeholder={placeholder} /></div>
  const tools: Record<number, [string, string][]> = { 1: [['profit', 'Revisar rentabilidad']], 2: [['guion', 'Crear guion para grabar']], 3: [['video', 'Analizar video'], ['creativo', 'Analizar creativo'], ['imagen?modo=fondo', 'Preparar foto para vender']], 4: [['hooks', 'Generar hooks desde fotos'], ['copy', 'Escribir el copy']], 5: [['whatsapp', 'Crear respuestas de WhatsApp']] }
  const copy = [d.hook, d.caption, d.hashtags].filter(Boolean).join('\n\n')
  return <><a className="tool-back" href="/panel/products">← Mi biblioteca de productos</a><span className="eyebrow">TU PRODUCTO, PASO A PASO</span><h1>{p.name}</h1><p className="muted">Guarda tu progreso y usa las herramientas en el momento adecuado.</p>
    <div className="note"><b>Marca: {user.brand.name || 'Sin completar'}</b><p className="tag">Público: {user.brand.audience || 'Por definir'} · Tono: {user.brand.tone || 'Por definir'} · Moneda: {user.brand.currency || 'PEN'}</p><a href="/panel/brand">Revisar Mi marca ↗</a></div>
    {saved && <p className="ok" role="status">Producto y contenido guardados.</p>}{error && <p className="err">Revisa el nombre y los enlaces: deben comenzar con http o https.</p>}
    <form method="post" action="/api/products"><input type="hidden" name="id" value={id} /><label htmlFor="name">Nombre del producto</label><input id="name" name="name" defaultValue={p.name} required maxLength={120} />
      <div className="journey-editor">{STEPS.map((s, i) => <section className="card journey-step" key={s.id}>{(i === 0 || STEPS[i - 1].week !== s.week) && <h3 className="journey-week">Semana {s.week} · {WEEKS.find(([w]) => w === s.week)![1]}</h3>}<div className="form-heading"><span className="form-step">{String(i + 1).padStart(2, '0')}</span><div><h2>{s.title}</h2><p>{s.desc}</p></div></div>
        {s.id === 0 && <><div className="row"><div><label htmlFor="reference">Enlace de referencia</label><input id="reference" name="reference" type="url" defaultValue={d.reference || ''} /></div><div><label htmlFor="supplier">Proveedor y contacto</label><input id="supplier" name="supplier" defaultValue={d.supplier || ''} maxLength={5000} /></div></div>{field('notes', 'Señales de interés y observaciones', 'Precio de la competencia, preguntas de compradores, disponibilidad y calidad de la muestra…')}</>}
        {s.id === 2 && <ul className="get"><li>Una toma del producto completo.</li><li>Una demostración de uso y beneficio.</li><li>Detalles, tamaño y contenido del paquete.</li><li>Un cierre con el siguiente paso para comprar.</li></ul>}
        {tools[s.id]?.map(([tool, label]) => <a key={tool} className="btn ghost" href={`/panel/tools/${tool}`} target="_blank" rel="noopener">{label} ↗</a>)}
        {s.guides?.map(g => <a key={g} className="btn ghost" href={`/panel/guias/${g}`}>{GUIDES[g].icon} Guía: {GUIDES[g].title} ↗</a>)}
        {s.id === 4 && <>{field('hook', 'Hook elegido', 'La primera frase de tu video o anuncio')}{field('caption', 'Texto de la publicación', 'Beneficio, demostración, oferta real y llamado a la acción')}{field('hashtags', 'Hashtags')}<label htmlFor="post_url">Enlace de tu publicación</label><input id="post_url" name="post_url" type="url" defaultValue={d.post_url || ''} /><p className="tag">Publica desde tu red social y guarda aquí el enlace. La publicación automática todavía no está conectada.</p></>}
        {s.id === 5 && <>{field('whatsapp', 'Respuestas y seguimiento', 'Saludo, precio, disponibilidad, entrega, formas de pago y seguimiento…')}<p className="tag">Usa estas respuestas en tu WhatsApp. Esta miniApp todavía no recibe ni envía mensajes.</p></>}
        {s.id === 6 && field('sales_notes', 'Pedidos, ventas y aprendizajes', 'Fecha, cantidad, estado del pedido y objeciones frecuentes. Evita guardar datos de pago.')}
        <label className="check"><input type="checkbox" name="done" value={s.id} defaultChecked={(d.done || []).includes(s.id)} />Marcar este paso como completado</label>
      </section>)}</div><button>Guardar producto y avances ✓</button></form>
    {copy && <section className="card"><h2>Tu publicación preparada</h2><p className="prepared-copy">{copy}</p><CopyText text={copy} />{safeWebUrl(d.post_url || '') && <p><a href={safeWebUrl(d.post_url)!} target="_blank" rel="noopener noreferrer">Ver publicación ↗</a></p>}</section>}
  </>
}
