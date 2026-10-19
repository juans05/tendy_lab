'use client'

import { useState } from 'react'

// Subida solo para el adulto: 3 permisos separados y desmarcados; el PIN se crea con la primera foto.
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function PhotoUpload({ code, hasPin, maxMb, maxFiles, onDone }: { code: string; hasPin: boolean; maxMb: number; maxFiles: number; onDone: () => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  function pick(list: FileList | null) {
    const next = Array.from(list ?? [])
    const msg = next.length > maxFiles ? `Elige hasta ${maxFiles} fotos.`
      : next.some(f => !TYPES.includes(f.type)) ? 'Solo fotos JPG, PNG o WebP.'
      : next.some(f => f.size > maxMb * 1024 * 1024) ? `Cada foto puede pesar hasta ${maxMb} MB.` : ''
    setError(msg); setFiles(msg ? [] : next)
  }
  function send(form: HTMLFormElement) {
    const data = new FormData(form)
    data.delete('files'); files.forEach(f => data.append('files', f)); data.set('k', code)
    const x = new XMLHttpRequest()
    x.open('POST', '/api/aventuras/fotos')
    x.upload.onprogress = e => e.lengthComputable && setProgress(Math.round(e.loaded / e.total * 100))
    x.onload = () => {
      setProgress(null)
      if (x.status === 200) return setSaved(true)
      try { setError(JSON.parse(x.responseText).error) } catch { setError('No pudimos guardar la foto. Inténtalo de nuevo.') }
    }
    x.onerror = () => { setProgress(null); setError('Se cortó la conexión. Revisa tu internet y pulsa Reintentar.') }
    setError(''); setProgress(0); x.send(data)
  }

  if (saved) return <div className="av-upload">
    <p className="av-ok">¡Foto guardada en privado! Ustedes la ven con el QR del kit y su PIN. No se publica: solo el equipo de TendyPeru puede revisarla para cuidar el contenido.</p>
    <a className="av-btn ghost" href={`/aventuras/mis-fotos?k=${code}`}>Ver mis fotos</a>
    <button className="av-btn" onClick={onDone}>Continuar</button>
  </div>

  return <form className="av-upload" onSubmit={e => { e.preventDefault(); send(e.currentTarget) }}>
    <p className="av-adult">👤 Solo para papá, mamá o tutor</p>
    <label className="av-file">📷 {files.length ? `${files.length} foto(s) elegida(s)` : 'Elegir fotografía'}
      <input type="file" name="files" accept={TYPES.join(',')} multiple={maxFiles > 1} onChange={e => pick(e.currentTarget.files)} />
    </label>
    <label className="av-check"><input type="checkbox" name="store" required /> Soy el adulto responsable y autorizo guardar esta foto en privado.</label>
    <label className="av-check"><input type="checkbox" name="gallery" /> Opcional: autorizo mostrar la figura en la galería de manualidades de TendyPeru, sin rostros ni datos del niño.</label>
    <label className="av-check"><input type="checkbox" name="ads" /> Opcional: autorizo usar la foto en publicidad de TendyPeru.</label>
    <label htmlFor="av-pin">{hasPin ? 'PIN de este kit' : 'Crea un PIN de 4 números para ver tus fotos después (evita 1234, 0000 o años)'}</label>
    <input id="av-pin" name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} required autoComplete={hasPin ? 'current-password' : 'new-password'} className="av-pin" />
    {error && <p className="av-err" role="alert">{error}</p>}
    {progress !== null ? <div className="av-progress light" role="progressbar" aria-valuenow={progress} aria-label="Subiendo"><span style={{ width: `${progress}%` }} /></div>
      : <button className="av-btn" disabled={!files.length}>{error && files.length ? 'Reintentar' : 'Guardar'}</button>}
    <a className="av-link" href="/aventuras/privacidad" target="_blank">Cómo cuidamos las fotos</a>
    <button type="button" className="av-link" onClick={onDone}>Continuar sin subir</button>
  </form>
}
