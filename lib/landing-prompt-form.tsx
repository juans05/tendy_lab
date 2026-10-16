'use client'
import { useState, type ReactNode } from 'react'
import { CopyText } from './copy-text'
import { MediaUpload } from './media-upload'
import { AMBIENTES, buildLandingPrompt, hexesIn, LANDING_FIELDS, OPCIONES, readableOn, TONOS, type LandingKey } from './landing-prompt'

export function LandingPromptForm({ brand, cost }: { brand: Record<string, string>; cost: string }) {
  // Lo que ya está en Mi marca se rellena solo; el usuario puede cambiarlo.
  const [form, setD] = useState<Partial<Record<LandingKey, string>>>({
    empresa: brand.name || '', pais: brand.country || '', publico: brand.audience || '',
    marca_visual: [brand.palette, brand.typography].filter(Boolean).join(' · '),
  })
  const [sel, setSel] = useState<Partial<Record<LandingKey, string[]>>>({ redes: OPCIONES.redes!.filter(r => brand.channels?.toLowerCase().includes(r.split(' ')[0].toLowerCase())) })
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [refs, setRefs] = useState([''])
  const pick = (k: LandingKey) => sel[k] ?? []
  const toggle = (k: LandingKey, o: string) => setSel(s => ({ ...s, [k]: pick(k).includes(o) ? pick(k).filter(x => x !== o) : [...pick(k), o] }))
  // Las casillas se convierten en texto para el prompt y la descripción.
  const d = {
    ...form,
    canal: pick('canal').join(', '),
    envios: [pick('envios').length ? `Pagos: ${pick('envios').join(', ')}` : '', form.envios?.trim()].filter(Boolean).join(' · '),
    redes: pick('redes').map(r => `${r}: ${urls[r]?.trim() || 'PENDIENTE'}`).join(', '),
  }
  const referencia = refs.map(r => r.trim()).filter(Boolean).join(', ')
  const [hexes] = useState(() => hexesIn(brand.palette))
  const [primary, setPrimary] = useState(hexes[0] || '#FE6900')
  const [accent, setAccent] = useState(hexes[1] || '#17324D')
  const [ambiente, setAmbiente] = useState<string>('elegante')
  const [tono, setTono] = useState<string>(TONOS.find(t => brand.tone?.toLowerCase().includes(t)) || 'cercano')
  // El prompt solo se arma al pulsar "Generar"; si luego cambian datos, se avisa para regenerarlo.
  const current = buildLandingPrompt(d, ambiente, tono, { primary, accent }, referencia)
  const [prompt, setPrompt] = useState('')
  const stale = prompt && prompt !== current
  const filled = LANDING_FIELDS.filter(([k]) => d[k]?.trim()).length
  // Para crearla en Tendy: los datos llenos viajan como descripción del producto.
  const description = LANDING_FIELDS.filter(([k]) => d[k]?.trim() && k !== 'whatsapp').map(([k, label]) => `${label}: ${d[k]!.trim()}`).join('\n').slice(0, 2000)
  const label = (k: LandingKey) => LANDING_FIELDS.find(f => f[0] === k)!
  const field = (k: LandingKey, text: string = label(k)[1]) => (
    <div key={k}><label htmlFor={`lp-${k}`}>{text}</label><input id={`lp-${k}`} maxLength={300} placeholder={label(k)[2]} value={form[k] ?? ''} onChange={e => setD({ ...form, [k]: e.target.value })} /></div>
  )
  const chips = (k: LandingKey, legend: string) => (
    <fieldset className="lp-chips lp-full"><legend>{legend} <small>Marca todas las que apliquen</small></legend>
      <div>{OPCIONES[k]!.map(o => <label key={o} className="lp-chip"><input type="checkbox" checked={pick(k).includes(o)} onChange={() => toggle(k, o)} />{o}</label>)}</div>
    </fieldset>
  )
  const group = (title: string, hint: string, body: ReactNode) => (
    <section className="lp-group"><h3>{title}</h3><p>{hint}</p><div className="lp-grid">{body}</div></section>
  )
  const step = (n: string, title: string, hint: string) => <div className="form-heading" style={n === '01' ? undefined : { marginTop: 28 }}><span className="form-step">{n}</span><div><h2>{title}</h2><p>{hint}</p></div></div>
  return (
    <div className="form">
      {step('01', 'Datos de tu producto', 'Completa lo que sepas. Lo vacío saldrá como PENDIENTE y la IA lo marcará en la página para que lo completes.')}
      <div className="lp-progress" role="status"><b>{filled} de {LANDING_FIELDS.length}</b> datos completos<span><i style={{ width: `${(filled / LANDING_FIELDS.length) * 100}%` }} /></span></div>
      {group('1. Tu producto', 'Lo básico: qué vendes y por qué lo necesitan.', <>
        {field('producto')}{field('empresa')}{field('que_es')}{field('problema')}
      </>)}
      {group('2. Características', 'Los detalles que el cliente pregunta antes de comprar.', <>
        {field('medidas')}{field('colores')}{field('funciones')}{field('incluye')}
      </>)}
      {group('3. Cliente y mercado', 'A quién le vendes, dónde y en qué fecha.', <>
        {field('publico')}{field('pais')}{field('temporada')}
      </>)}
      {group('4. Precio y venta', 'Cómo te compran, cómo te pagan y cómo llega el pedido.', <>
        {field('precio')}{field('whatsapp')}
        {chips('canal', 'Canal de venta')}
        {chips('envios', 'Formas de pago')}
        <div className="lp-full">{field('envios', 'Envíos y garantía')}</div>
      </>)}
      {group('5. Redes y marca', 'Marca tus redes y pega el enlace de cada una.', <>
        {chips('redes', 'Redes sociales')}
        {pick('redes').map(r => <div key={r}><label htmlFor={`lp-red-${r}`}>Enlace de {r}</label><input id={`lp-red-${r}`} type="url" maxLength={300} placeholder="https://…" value={urls[r] ?? ''} onChange={e => setUrls({ ...urls, [r]: e.target.value })} /></div>)}
        <div className="lp-full">{field('marca_visual')}</div>
      </>)}

      {step('02', 'El estilo de tu página', 'Elige los colores de tu marca, el ambiente y el tono. Si guardaste códigos de color en Mi marca, ya están puestos.')}
      <div className="row">
        <div><label htmlFor="lp-primary">Color principal (botones)</label><input id="lp-primary" type="color" className="lp-color" value={primary} onChange={e => setPrimary(e.target.value)} /></div>
        <div><label htmlFor="lp-accent">Color de acento (títulos)</label><input id="lp-accent" type="color" className="lp-color" value={accent} onChange={e => setAccent(e.target.value)} /></div>
        <div><label htmlFor="lp-ambiente">Ambiente</label><select id="lp-ambiente" value={ambiente} onChange={e => setAmbiente(e.target.value)}>{AMBIENTES.map(a => <option key={a}>{a}</option>)}</select></div>
        <div><label htmlFor="lp-tono">Tono de los textos</label><select id="lp-tono" value={tono} onChange={e => setTono(e.target.value)}>{TONOS.map(t => <option key={t}>{t}</option>)}</select></div>
      </div>
      <div className="lp-swatch" aria-label="Vista previa de colores"><b style={{ color: accent }}>{d.producto || 'Tu producto'}</b><span style={{ background: primary, color: readableOn(primary) }}>Pedir ahora ↗</span></div>
      <section className="lp-group"><h3>Webs de referencia <small>(opcional)</small></h3>
        <p>La IA toma su estructura, tipografías y espacios, pero no copia su marca ni sus textos. Es el truco que más evita que tu web parezca hecha con IA.</p>
        {refs.map((r, i) => <div key={i}><label htmlFor={`lp-ref-${i}`}>Web {i + 1}</label><input id={`lp-ref-${i}`} type="url" maxLength={300} placeholder="https://… (de Awwwards, Godly o Land-book)" value={r} onChange={e => setRefs(refs.map((x, j) => (j === i ? e.target.value : x)))} /></div>)}
        {refs.length < 5 && <button type="button" className="btn ghost lp-add" onClick={() => setRefs([...refs, ''])}>+ Agregar otra web</button>}
      </section>

      {step('03', 'Opción A · Tu prompt para Claude o ChatGPT', 'Cuando termines, genera el prompt. Cópialo, pégalo junto a tus fotos y videos, y la IA crea la landing completa.')}
      <button type="button" className="btn lg" onClick={() => setPrompt(current)} disabled={!d.producto?.trim()}>{prompt ? '↻ Volver a generar' : '✨ Generar mi prompt'}</button>
      {!d.producto?.trim() && <p className="tag">Escribe al menos el nombre del producto.</p>}
      {stale && <p className="tag" role="status">Cambiaste datos después de generar. Pulsa «Volver a generar» para incluirlos.</p>}
      {prompt && <>
        <textarea className="prompt-box" readOnly rows={12} value={prompt} aria-label="Prompt generado" />
        <CopyText text={prompt} />
      </>}
      <div className="note"><b>🧭 Cómo usarlo</b><ol><li>Copia el prompt.</li><li>Ábrelo en <b>Claude</b> o <b>ChatGPT</b> (con búsqueda web activada), o en <b>Lovable</b> / <b>v0</b> si quieres publicarla directo.</li><li>Adjunta tus fotos y videos del producto en el mismo mensaje.</li><li>Revisa la lista de PENDIENTES que te devuelva y completa esos datos.</li></ol></div>

      {step('04', 'Opción B · Créala aquí en Tendy', 'Usamos los datos y colores de arriba. Sube tus fotos, pon el precio y la publicamos con formulario de pedido y WhatsApp.')}
      <form method="post" action="/api/runs" encType="multipart/form-data" className="lp-create">
        <input type="hidden" name="tool" value="landing" /><input type="hidden" name="description" value={description} />
        <input type="hidden" name="whatsapp" value={d.whatsapp ?? ''} /><input type="hidden" name="color_primary" value={primary} /><input type="hidden" name="color_accent" value={accent} />
        <MediaUpload tool="hooks" />
        <label htmlFor="lp-price">Precio por unidad ({brand.currency || 'moneda de Mi marca'})</label><input id="lp-price" name="price" type="number" step="0.01" min="0.01" max="1000000" required />
        {!d.producto?.trim() && <p className="tag">Escribe al menos el nombre del producto en el paso 01.</p>}
        {(!brand.name || !brand.currency) && <p className="err">Antes completa el nombre y la moneda en <a href="/panel/brand">Mi marca</a>.</p>}
        <p className="note">Costo: <b>{cost}</b>. Si falla, se devuelve automáticamente.</p>
        <button disabled={!d.producto?.trim()}>Crear mi página en Tendy ↗</button>
      </form>
    </div>
  )
}
