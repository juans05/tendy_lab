'use client'

import { useState } from 'react'
import { ghostSrc } from './av-ghost'

// El diploma se dibuja en el celular: el nombre del niño nunca sale del dispositivo.
const load = (src: string) => new Promise<HTMLImageElement>((ok, ko) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = ko; i.src = src })

async function draw(name: string, p: { title: string; collection: string; character: string; image?: string }) {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 1131
  const x = c.getContext('2d')!
  x.fillStyle = '#fffaf4'; x.fillRect(0, 0, 1600, 1131)
  x.strokeStyle = '#fe6900'; x.lineWidth = 18; x.strokeRect(40, 40, 1520, 1051)
  x.strokeStyle = '#461577'; x.lineWidth = 4; x.strokeRect(78, 78, 1444, 975)
  x.textAlign = 'center'; x.fillStyle = '#461577'
  x.font = '800 78px system-ui, sans-serif'; x.fillText('DIPLOMA DE PEQUEÑO ARTISTA', 800, 220)
  const img = await load(p.image ?? ghostSrc(true)).catch(() => load(ghostSrc(true)))
  x.drawImage(img, 690, 270, 220, 242)
  x.fillStyle = '#202020'; x.font = '700 60px system-ui, sans-serif'
  x.fillText(name ? `¡Felicitaciones, ${name}!` : '¡Felicitaciones!', 800, 600)
  x.font = '400 40px system-ui, sans-serif'
  x.fillText(`Has completado la aventura de ${p.character}:`, 800, 680)
  x.font = 'italic 600 42px system-ui, sans-serif'; x.fillText(`«${p.title}»`, 800, 745)
  x.font = '600 32px system-ui, sans-serif'; x.fillStyle = '#5d5a55'
  x.fillText(`${p.collection} · ${new Date().toLocaleDateString('es-PE')}`, 800, 880)
  x.fillStyle = '#fe6900'; x.font = '800 46px system-ui, sans-serif'; x.fillText('TendyPeru', 800, 970)
  return new Promise<Blob>(ok => c.toBlob(b => ok(b!), 'image/png'))
}

export function Diploma(p: { title: string; collection: string; character: string; image?: string; onDownload?: () => void }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const file = async () => new File([await draw(name.trim().slice(0, 30), p)], 'diploma-tendy.png', { type: 'image/png' })
  async function download() {
    setBusy(true)
    const url = URL.createObjectURL(await file())
    const a = document.createElement('a'); a.href = url; a.download = 'diploma-tendy.png'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    setBusy(false); p.onDownload?.()
  }
  async function share() {
    const f = await file()
    if (navigator.canShare?.({ files: [f] })) await navigator.share({ files: [f], title: 'Mi diploma Tendy' }).catch(() => {})
    else download()
  }
  return <div className="av-diploma">
    <label htmlFor="av-name">Nombre para el diploma (opcional)</label>
    <input id="av-name" value={name} onChange={e => setName(e.target.value)} maxLength={30} autoComplete="off" placeholder="Solo se escribe en el diploma, no se guarda" />
    <button className="av-btn" onClick={download} disabled={busy}>⬇ Descargar mi diploma</button>
    <button className="av-btn ghost" onClick={share}>Compartir</button>
  </div>
}
