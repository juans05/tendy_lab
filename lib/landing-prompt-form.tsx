'use client'
import { useState } from 'react'
import { CopyText } from './copy-text'
import { MediaUpload } from './media-upload'
import { AMBIENTES, buildLandingPrompt, hexesIn, LANDING_FIELDS, readableOn, TONOS, type LandingKey } from './landing-prompt'

export function LandingPromptForm({ brand, cost }: { brand: Record<string, string>; cost: string }) {
  // Lo que ya está en Mi marca se rellena solo; el usuario puede cambiarlo.
  const [d, setD] = useState<Partial<Record<LandingKey, string>>>({
    empresa: brand.name || '', pais: brand.country || '', publico: brand.audience || '', redes: brand.channels || '',
    marca_visual: [brand.palette, brand.typography].filter(Boolean).join(' · '),
  })
  const [hexes] = useState(() => hexesIn(brand.palette))
  const [primary, setPrimary] = useState(hexes[0] || '#FE6900')
  const [accent, setAccent] = useState(hexes[1] || '#17324D')
  const [ambiente, setAmbiente] = useState<string>('elegante')
  const [referencia, setReferencia] = useState('')
  const [tono, setTono] = useState<string>(TONOS.find(t => brand.tone?.toLowerCase().includes(t)) || 'cercano')
  const prompt = buildLandingPrompt(d, ambiente, tono, { primary, accent }, referencia)
  const filled = LANDING_FIELDS.filter(([k]) => d[k]?.trim()).length
  // Para crearla en Tendy: los datos llenos viajan como descripción del producto.
  const description = LANDING_FIELDS.filter(([k]) => d[k]?.trim() && k !== 'whatsapp').map(([k, label]) => `${label}: ${d[k]!.trim()}`).join('\n').slice(0, 2000)
  const step = (n: string, title: string, hint: string) => <div className="form-heading" style={n === '01' ? undefined : { marginTop: 28 }}><span className="form-step">{n}</span><div><h2>{title}</h2><p>{hint}</p></div></div>
  return (
    <div className="form">
      {step('01', 'Datos de tu producto', 'Completa lo que sepas. Lo vacío saldrá como PENDIENTE y la IA lo marcará en la página para que lo completes.')}
      <div className="lp-progress" role="status"><b>{filled} de {LANDING_FIELDS.length}</b> datos completos<span><i style={{ width: `${(filled / LANDING_FIELDS.length) * 100}%` }} /></span></div>
      <div className="lp-grid">
        {LANDING_FIELDS.map(([k, label, ph]) => (
          <div key={k}><label htmlFor={`lp-${k}`}>{label}</label><input id={`lp-${k}`} maxLength={300} placeholder={ph} value={d[k] ?? ''} onChange={e => setD({ ...d, [k]: e.target.value })} /></div>
        ))}
      </div>

      {step('02', 'El estilo de tu página', 'Elige los colores de tu marca, el ambiente y el tono. Si guardaste códigos de color en Mi marca, ya están puestos.')}
      <div className="row">
        <div><label htmlFor="lp-primary">Color principal (botones)</label><input id="lp-primary" type="color" className="lp-color" value={primary} onChange={e => setPrimary(e.target.value)} /></div>
        <div><label htmlFor="lp-accent">Color de acento (títulos)</label><input id="lp-accent" type="color" className="lp-color" value={accent} onChange={e => setAccent(e.target.value)} /></div>
        <div><label htmlFor="lp-ambiente">Ambiente</label><select id="lp-ambiente" value={ambiente} onChange={e => setAmbiente(e.target.value)}>{AMBIENTES.map(a => <option key={a}>{a}</option>)}</select></div>
        <div><label htmlFor="lp-tono">Tono de los textos</label><select id="lp-tono" value={tono} onChange={e => setTono(e.target.value)}>{TONOS.map(t => <option key={t}>{t}</option>)}</select></div>
      </div>
      <label htmlFor="lp-ref">Web de referencia (opcional)</label><input id="lp-ref" type="url" maxLength={300} placeholder="Ej.: una web que te guste de Awwwards, Godly o Land-book" value={referencia} onChange={e => setReferencia(e.target.value)} />
      <p className="tag">La IA toma su estructura, tipografías y espacios, pero no copia su marca ni sus textos. Es el truco que más evita que tu web parezca hecha con IA.</p>
      <div className="lp-swatch" aria-label="Vista previa de colores"><b style={{ color: accent }}>{d.producto || 'Tu producto'}</b><span style={{ background: primary, color: readableOn(primary) }}>Pedir ahora ↗</span></div>

      {step('03', 'Opción A · Tu prompt para Claude o ChatGPT', 'Cópialo, pégalo junto a tus fotos y videos, y la IA crea la landing completa con investigación, diseño y SEO.')}
      <textarea className="prompt-box" readOnly rows={12} value={prompt} aria-label="Prompt generado" />
      <CopyText text={prompt} />
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
