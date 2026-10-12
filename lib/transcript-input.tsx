'use client'
import { useState } from 'react'
import { MediaUpload } from './media-upload'
export function TranscriptInput({ linksEnabled }: { linksEnabled: boolean }) {
  const [link, setLink] = useState(false)
  return <section><div className="row"><button className={!link ? 'btn' : 'btn ghost'} type="button" onClick={() => setLink(false)}>Subir video</button><button className={link ? 'btn' : 'btn ghost'} type="button" disabled={!linksEnabled} onClick={() => setLink(true)}>Pegar enlace</button></div>{link ? <><label htmlFor="source_url">Enlace del video público</label><input id="source_url" name="source_url" type="url" required placeholder="https://www.instagram.com/reel/..." /><p className="tag">Usa el enlace completo. Si requiere iniciar sesión o la red bloquea la descarga, sube el archivo.</p></> : <MediaUpload tool="video" />}{!linksEnabled && <p className="tag">La descarga por enlace todavía no está configurada en este servidor. Puedes subir tu video.</p>}<p className="note">Hasta 90 segundos. Incluye texto con tiempos, estructura del mensaje y una paráfrasis para Mi marca por 10 monedas.</p></section>
}
