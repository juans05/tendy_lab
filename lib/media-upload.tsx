'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from './icons'

export function MediaUpload({ tool }: { tool: 'video' | 'hooks' | 'creativo' | 'referencias' }) {
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const video = tool === 'video'
  const refs = tool === 'referencias' // opcional: imágenes de referencia para Crea una imagen
  const max = tool === 'hooks' ? 5 : refs ? 3 : 1
  const limit = (video ? 100 : 10) * 1024 * 1024
  const accept = video ? 'video/mp4,video/quicktime,video/webm' : 'image/jpeg,image/png,image/webp'

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [files])

  function sync(next: File[]) {
    const transfer = new DataTransfer()
    next.forEach(file => transfer.items.add(file))
    if (input.current) input.current.files = transfer.files
    setFiles(next)
  }
  function select(selected: File[]) {
    const next = max > 1 ? [...files, ...selected].filter((file, i, all) => all.findIndex(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified) === i) : selected
    let message = ''
    if (next.length > max) message = `Puedes agregar hasta ${max} ${video ? 'video' : 'imagen' + (max > 1 ? 'es' : '')}.`
    else if (next.some(file => !accept.split(',').includes(file.type))) message = `Elige ${video ? 'un video MP4, MOV o WebM' : 'imágenes JPG, PNG o WEBP'}.`
    else if (next.some(file => file.size > limit || file.size === 0)) message = `Cada archivo debe tener contenido y pesar como máximo ${video ? 100 : 10} MB.`
    setError(message)
    sync(message ? files : next)
  }
  return <div className="media-uploader">
    <div className="upload-heading"><label htmlFor="files">{video ? 'Tu video' : tool === 'hooks' ? 'Fotos de tu producto' : refs ? 'Imágenes de referencia (opcional)' : 'Tu imagen'}</label><span>{refs ? 'Hasta 3 imágenes' : max > 1 ? 'De 1 a 5 imágenes' : '1 archivo'}</span></div>
    <div className={`upload-zone${dragging ? ' is-dragging' : ''}${files.length ? ' has-files' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }} onDrop={e => { e.preventDefault(); setDragging(false); select(Array.from(e.dataTransfer.files)) }}>
      <input ref={input} className="upload-native" id="files" name="files" type="file" accept={accept} multiple={max > 1} required={!refs} aria-describedby="upload-help upload-error" onChange={e => { const selected = Array.from(e.currentTarget.files || []); if (selected.length) select(selected) }} />
      {!files.length ? <><Icon name={video ? 'video' : 'creativo'} /><h3>{dragging ? 'Suelta tu archivo aquí' : video ? 'Dale una nueva mirada a tu video' : refs ? 'Tu producto real o un estilo que te guste' : 'Tu próximo análisis empieza aquí'}</h3><p>Arrastra {max > 1 ? 'tus imágenes' : 'tu archivo'} aquí o selecciónalo desde tu dispositivo.</p></> : <div className="upload-previews">{files.map((file, i) => <article className="upload-file" key={`${file.name}-${file.size}-${file.lastModified}`}>
        <div className="upload-preview">{video ? <video src={previews[i]} controls preload="metadata" onLoadedMetadata={e => { if (e.currentTarget.duration > 90) { setError('Tu video dura más de 90 segundos. Recórtalo antes de analizarlo.'); input.current?.setCustomValidity('El video debe durar hasta 90 segundos.') } else input.current?.setCustomValidity('') }} /> : <img src={previews[i]} alt={`Vista previa de ${file.name}`} />}</div>
        <div className="upload-file-info"><b title={file.name}>{file.name}</b><span>{(file.size / 1024 / 1024).toLocaleString('es-PE', { maximumFractionDigits: 2 })} MB · Seleccionado</span></div><button type="button" className="link" aria-label={`Quitar ${file.name}`} onClick={() => { sync(files.filter((_, index) => index !== i)); setError(''); input.current?.setCustomValidity('') }}>Quitar</button>
      </article>)}</div>}
      {files.length < max || max === 1 ? <button type="button" className="btn upload-pick" onClick={() => input.current?.click()}>{files.length ? max > 1 ? '+ Agregar imágenes' : 'Cambiar archivo' : video ? 'Seleccionar video' : max > 1 ? 'Seleccionar imágenes' : 'Seleccionar imagen'} <span aria-hidden="true">↑</span></button> : null}
      <p id="upload-help" className="upload-help">{video ? 'MP4, MOV o WebM · Hasta 90 segundos · Máximo 100 MB' : 'JPG, PNG o WEBP · Máximo 10 MB por imagen'}</p>
    </div>
    <p id="upload-error" className={error ? 'err' : 'sr-only'} role="status">{error}</p>
    <div className="upload-assurance"><span aria-hidden="true">✓</span> {refs ? 'Si muestras tu producto, se conserva; si muestras un estilo, se usa como inspiración. Indícalo en el tema.' : files.length ? 'Archivo seleccionado. Pulsa “Analizar mi contenido” para enviarlo.' : 'La vista previa se muestra antes de enviar tu archivo.'}</div>
  </div>
}
