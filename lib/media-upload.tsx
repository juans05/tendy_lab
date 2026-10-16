'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from './icons'

// file.type llega vacío para .opus en algunos sistemas: también se acepta por extensión (el servidor valida la firma real).
const AUDIO_ACCEPT = ',audio/ogg,audio/opus,audio/mpeg,audio/mp4,audio/x-m4a,.opus,.ogg,.oga,.mp3,.m4a'
const isAudio = (f: File) => f.type.startsWith('audio/') || /\.(opus|ogg|oga|mp3|m4a)$/i.test(f.name)

export function MediaUpload({ tool }: { tool: 'video' | 'transcribir' | 'hooks' | 'creativo' | 'referencias' | 'angulos' | 'retrato' }) {
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const audio = tool === 'transcribir' // Audio y video a texto: también notas de voz de WhatsApp, hasta 5 minutos
  const video = tool === 'video' || audio
  const maxSec = audio ? 300 : 90
  const refs = tool === 'referencias' // opcional: imágenes de referencia para Crea una imagen
  const angles = tool === 'angulos' // Tu producto en 3D: de 2 a 3 ángulos del mismo producto
  const people = tool === 'retrato' // Retrato y portada: de 1 a 3 fotos de la persona
  const max = tool === 'hooks' ? 5 : refs || angles || people ? 3 : 1
  const limit = (video ? 100 : 10) * 1024 * 1024
  const accept = video ? 'video/mp4,video/quicktime,video/webm' + (audio ? AUDIO_ACCEPT : '') : 'image/jpeg,image/png,image/webp'

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [files])
  useEffect(() => { if (angles) input.current?.setCustomValidity(files.length === 1 ? 'Agrega al menos 2 fotos desde ángulos distintos.' : '') }, [angles, files])

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
    else if (next.some(file => !accept.split(',').includes(file.type) && !(audio && isAudio(file)))) message = `Elige ${audio ? 'una nota de voz, un audio (MP3, M4A) o un video (MP4, MOV, WebM)' : video ? 'un video MP4, MOV o WebM' : 'imágenes JPG, PNG o WEBP'}.`
    else if (next.some(file => file.size > limit || file.size === 0)) message = `Cada archivo debe tener contenido y pesar como máximo ${video ? 100 : 10} MB.`
    setError(message)
    sync(message ? files : next)
  }
  return <div className="media-uploader">
    <div className="upload-heading"><label htmlFor="files">{audio ? 'Tu audio o video' : video ? 'Tu video' : tool === 'hooks' ? 'Fotos de tu producto' : angles ? 'Fotos desde distintos ángulos' : people ? 'Tus fotos' : refs ? 'Imágenes de referencia (opcional)' : 'Tu imagen'}</label><span>{refs ? 'Hasta 3 imágenes' : angles ? 'De 2 a 3 imágenes' : people ? 'De 1 a 3 imágenes' : max > 1 ? 'De 1 a 5 imágenes' : '1 archivo'}</span></div>
    <div className={`upload-zone${dragging ? ' is-dragging' : ''}${files.length ? ' has-files' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }} onDrop={e => { e.preventDefault(); setDragging(false); select(Array.from(e.dataTransfer.files)) }}>
      <input ref={input} className="upload-native" id="files" name="files" type="file" accept={accept} multiple={max > 1} required={!refs} aria-describedby="upload-help upload-error" onChange={e => { const selected = Array.from(e.currentTarget.files || []); if (selected.length) select(selected) }} />
      {!files.length ? <><Icon name={audio ? 'transcribir' : video ? 'video' : 'creativo'} /><h3>{dragging ? 'Suelta tu archivo aquí' : audio ? 'Tu nota de voz, audio o video' : video ? 'Dale una nueva mirada a tu video' : refs ? 'Tu producto real o un estilo que te guste' : people ? 'Fotos tuyas de frente y bien iluminadas' : 'Tu próximo análisis empieza aquí'}</h3><p>Arrastra {max > 1 ? 'tus imágenes' : 'tu archivo'} aquí o selecciónalo desde tu dispositivo.</p></> : <div className="upload-previews">{files.map((file, i) => <article className="upload-file" key={`${file.name}-${file.size}-${file.lastModified}`}>
        <div className="upload-preview">{video ? (() => { const checkDuration = (e: { currentTarget: HTMLMediaElement }) => { if (e.currentTarget.duration > maxSec) { setError(`Tu archivo dura más de ${audio ? '5 minutos' : '90 segundos'}. Recórtalo antes de enviarlo.`); input.current?.setCustomValidity(`El archivo debe durar hasta ${audio ? '5 minutos' : '90 segundos'}.`) } else input.current?.setCustomValidity('') }; return audio && isAudio(file) ? <audio src={previews[i]} controls preload="metadata" onLoadedMetadata={checkDuration} style={{ width: '100%' }} /> : <video src={previews[i]} controls preload="metadata" onLoadedMetadata={checkDuration} /> })() : <img src={previews[i]} alt={`Vista previa de ${file.name}`} />}</div>
        <div className="upload-file-info"><b title={file.name}>{file.name}</b><span>{(file.size / 1024 / 1024).toLocaleString('es-PE', { maximumFractionDigits: 2 })} MB · Seleccionado</span></div><button type="button" className="link" aria-label={`Quitar ${file.name}`} onClick={() => { sync(files.filter((_, index) => index !== i)); setError(''); input.current?.setCustomValidity('') }}>Quitar</button>
      </article>)}</div>}
      {files.length < max || max === 1 ? <button type="button" className="btn upload-pick" onClick={() => input.current?.click()}>{files.length ? max > 1 ? '+ Agregar imágenes' : 'Cambiar archivo' : audio ? 'Seleccionar archivo' : video ? 'Seleccionar video' : max > 1 ? 'Seleccionar imágenes' : 'Seleccionar imagen'} <span aria-hidden="true">↑</span></button> : null}
      <p id="upload-help" className="upload-help">{audio ? 'Nota de voz de WhatsApp, MP3, M4A, MP4, MOV o WebM · Hasta 5 minutos · Máximo 100 MB' : video ? 'MP4, MOV o WebM · Hasta 90 segundos · Máximo 100 MB' : 'JPG, PNG o WEBP · Máximo 10 MB por imagen'}</p>
    </div>
    <p id="upload-error" className={error ? 'err' : 'sr-only'} role="status">{error}</p>
    <div className="upload-assurance"><span aria-hidden="true">✓</span> {people ? 'Usa fotos recientes, de frente y con buena luz: así se conserva tu cara.' : refs ? 'Si muestras tu producto, se conserva; si muestras un estilo, se usa como inspiración. Indícalo en el tema.' : files.length ? 'Archivo seleccionado. Pulsa “Analizar mi contenido” para enviarlo.' : 'La vista previa se muestra antes de enviar tu archivo.'}</div>
  </div>
}
