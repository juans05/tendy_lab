'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PinForm({ code }: { code: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  async function submit(form: HTMLFormElement) {
    setError('')
    const r = await fetch('/api/aventuras/album', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: code, pin: new FormData(form).get('pin') }) }).catch(() => null)
    if (r?.ok) return router.refresh()
    setError(r ? (await r.json()).error : 'Revisa tu conexión e inténtalo de nuevo.')
  }
  return <form className="av-upload" onSubmit={e => { e.preventDefault(); submit(e.currentTarget) }}>
    <label htmlFor="av-pin">Ingresa el PIN que creaste al guardar la primera foto</label>
    <input id="av-pin" name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} required autoComplete="current-password" className="av-pin" />
    {error && <p className="av-err" role="alert">{error}</p>}
    <button className="av-btn">Ver mis fotos</button>
  </form>
}

const LABEL = { store: 'Guardar en privado', gallery: 'Galería de manualidades', ads: 'Publicidad' } as const

export function AlbumActions({ photos }: { photos: { id: string; date: string; consents: (keyof typeof LABEL)[] }[] }) {
  const router = useRouter()
  const [confirmAll, setConfirmAll] = useState(false)
  const [error, setError] = useState('')
  const call = async (url: string, init: RequestInit) => {
    const r = await fetch(url, init).catch(() => null)
    if (r?.ok) router.refresh(); else setError('No se pudo completar. Vuelve a escanear el QR e ingresa tu PIN.')
  }
  return <>
    {error && <p className="av-err" role="alert">{error}</p>}
    <ul className="av-album">{photos.map(p => <li key={p.id}>
      <img src={`/api/aventuras/fotos/${p.id}`} alt={`Foto guardada el ${p.date}`} />
      <p className="av-meta">Guardada el {p.date}</p>
      <ul className="av-consents">{p.consents.map(c => <li key={c}>✓ {LABEL[c]}{c !== 'store' && <button className="av-link" onClick={() => call('/api/aventuras/consentimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ media_id: p.id, purpose: c }) })}>Retirar</button>}</li>)}</ul>
      <button className="av-btn ghost" onClick={() => call(`/api/aventuras/fotos/${p.id}`, { method: 'DELETE' })}>🗑 Borrar esta foto</button>
    </li>)}</ul>
    {confirmAll ? <div className="av-note">
      <p>Se borrarán todas las fotos, sus permisos y el PIN de este kit. No se puede deshacer.</p>
      <button className="av-btn" onClick={() => call('/api/aventuras/album', { method: 'DELETE' })}>Sí, borrar todo</button>
      <button className="av-link" onClick={() => setConfirmAll(false)}>Cancelar</button>
    </div> : <button className="av-link" onClick={() => setConfirmAll(true)}>Borrar todo</button>}
  </>
}
