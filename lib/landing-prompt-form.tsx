'use client'
import { useState } from 'react'
import { CopyText } from './copy-text'
import { AMBIENTES, buildLandingPrompt, LANDING_FIELDS, TONOS, type LandingKey } from './landing-prompt'

export function LandingPromptForm({ brand }: { brand: Record<string, string> }) {
  // Lo que ya está en Mi marca se rellena solo; el usuario puede cambiarlo.
  const [d, setD] = useState<Partial<Record<LandingKey, string>>>({
    empresa: brand.name || '', pais: brand.country || '', publico: brand.audience || '', redes: brand.channels || '',
    marca_visual: [brand.palette, brand.typography].filter(Boolean).join(' · '),
  })
  const [ambiente, setAmbiente] = useState<string>('elegante')
  const [tono, setTono] = useState<string>(TONOS.find(t => brand.tone?.toLowerCase().includes(t)) || 'cercano')
  const prompt = buildLandingPrompt(d, ambiente, tono)
  const filled = LANDING_FIELDS.filter(([k]) => d[k]?.trim()).length
  return (
    <div className="form">
      <div className="form-heading"><span className="form-step">01</span><div><h2>Datos de tu producto</h2><p>Completa lo que sepas. Lo que dejes vacío saldrá como PENDIENTE en el prompt, y la IA lo marcará en la página para que lo completes.</p></div></div>
      <div className="lp-progress" role="status"><b>{filled} de {LANDING_FIELDS.length}</b> datos completos<span><i style={{ width: `${(filled / LANDING_FIELDS.length) * 100}%` }} /></span></div>
      <div className="lp-grid">
        {LANDING_FIELDS.map(([k, label, ph]) => (
          <div key={k}><label htmlFor={`lp-${k}`}>{label}</label><input id={`lp-${k}`} maxLength={300} placeholder={ph} value={d[k] ?? ''} onChange={e => setD({ ...d, [k]: e.target.value })} /></div>
        ))}
      </div>
      <div className="row">
        <div><label htmlFor="lp-ambiente">Ambiente de la página</label><select id="lp-ambiente" value={ambiente} onChange={e => setAmbiente(e.target.value)}>{AMBIENTES.map(a => <option key={a}>{a}</option>)}</select></div>
        <div><label htmlFor="lp-tono">Tono de los textos</label><select id="lp-tono" value={tono} onChange={e => setTono(e.target.value)}>{TONOS.map(t => <option key={t}>{t}</option>)}</select></div>
      </div>
      <div className="form-heading" style={{ marginTop: 28 }}><span className="form-step">02</span><div><h2>Tu prompt, listo para copiar</h2><p>Se actualiza mientras escribes.</p></div></div>
      <textarea className="prompt-box" readOnly rows={14} value={prompt} aria-label="Prompt generado" />
      <CopyText text={prompt} />
      <div className="note"><b>🧭 Cómo usarlo</b><ol><li>Copia el prompt.</li><li>Ábrelo en <b>Claude</b> o <b>ChatGPT</b> (con búsqueda web activada), o en <b>Lovable</b> / <b>v0</b> si quieres publicarla directo.</li><li>Adjunta tus fotos y videos del producto en el mismo mensaje.</li><li>Revisa la lista de PENDIENTES que te devuelva y completa esos datos.</li></ol></div>
      <div className="note"><b>¿Prefieres algo más rápido?</b><p className="tag">Con Página de producto, Tendy crea y publica una página con formulario de pedido y WhatsApp en un minuto.</p><a className="btn ghost" href="/panel/tools/landing">Ir a Página de producto ↗</a></div>
    </div>
  )
}
