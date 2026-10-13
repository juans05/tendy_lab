'use client'
import { useState } from 'react'
import { MediaUpload } from './media-upload'

// "Copiar el estilo de una imagen" pide la imagen y deja la idea opcional; el resto de destinos es solo texto.
// targets llega del servidor: meta.ts importa credits → db y no puede ir al bundle del cliente.
export function PromptFields({ targets }: { targets: Record<string, [string, string, string, string]> }) {
  const [target, setTarget] = useState(Object.keys(targets)[0])
  const copy = target === 'copiar'
  return <>
    <label htmlFor="target">¿Para qué es tu prompt?</label>
    <select id="target" name="target" value={target} onChange={e => setTarget(e.target.value)}>{Object.entries(targets).map(([v, [label, where]]) => <option key={v} value={v}>{label} · {where}</option>)}</select>
    {copy && <><MediaUpload tool="creativo" /><p className="tag">Funciona mejor con un sujeto claro. Con composiciones cargadas, arte abstracto o mucho texto el resultado será menos fiel.</p></>}
    <label htmlFor="description">{copy ? 'Qué quieres cambiar (opcional)' : 'Tu idea o tu prompt actual'}</label>
    <textarea id="description" name="description" required={!copy} maxLength={2000} rows={5} placeholder={copy ? 'Ej.: el mismo estilo, pero con mi botella de vidrio ámbar de 250 ml en lugar del perfume.' : 'Ej.: quiero una foto bonita de mi perfume para Instagram. / Pega aquí el prompt que encontraste en una librería (YouMind, Meigen AI, PromptBase) o el que ya usaste.'} />
    <p className="tag">{['imagen', 'foto', 'video', 'copiar'].includes(target) ? 'Te lo devolvemos en inglés, que es el idioma en el que mejor responden las IA de imagen y video, con su traducción al español para que entiendas qué pide.' : 'No hace falta escribir perfecto: te lo devolvemos detallado, con los colores, tono y público de Mi marca, y te decimos dónde pegarlo.'}</p>
  </>
}
