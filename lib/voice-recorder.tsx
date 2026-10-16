'use client'

import { useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 180
const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Nota de voz para Mi semana: graba en el navegador y deja el archivo en el input "voice" del formulario.
// Sin MediaRecorder o sin permiso de micrófono, se puede subir un audio.
export function VoiceRecorder() {
  const input = useRef<HTMLInputElement>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const [supported, setSupported] = useState(true)
  const [denied, setDenied] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => { setSupported(typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia) }, [])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  useEffect(() => {
    if (!recording) return
    const timer = setInterval(() => setSeconds(s => { if (s + 1 >= MAX_SECONDS) recorder.current?.stop(); return s + 1 }), 1000)
    return () => clearInterval(timer)
  }, [recording])

  function keep(file: File | null) {
    const transfer = new DataTransfer()
    if (file) transfer.items.add(file)
    if (input.current) input.current.files = transfer.files
    setUrl(file ? URL.createObjectURL(file) : '')
  }
  async function start() {
    let stream: MediaStream
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) } catch { setDenied(true); return }
    const chunks: Blob[] = []
    const rec = new MediaRecorder(stream)
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      setRecording(false)
      const type = rec.mimeType || 'audio/webm'
      keep(new File([new Blob(chunks, { type })], type.includes('mp4') ? 'nota.m4a' : 'nota.webm', { type }))
    }
    recorder.current = rec
    keep(null)
    setSeconds(0)
    rec.start()
    setRecording(true)
  }

  if (!supported || denied) return <div>
    {denied && <p className="err">No pudimos usar tu micrófono. Puedes escribir lo que vendes o subir un audio.</p>}
    <label htmlFor="voice">Sube una nota de voz (opcional)</label>
    <input id="voice" name="voice" type="file" accept="audio/*,.opus,.ogg,.m4a,.mp3" />
    <p className="tag">Cuenta qué vendes, para quién es y qué lo hace especial. Hasta 3 minutos.</p>
  </div>
  return <div>
    <input ref={input} name="voice" type="file" hidden />
    <div className="row">
      {recording
        ? <button type="button" className="btn" onClick={() => recorder.current?.stop()}>■ Detener ({time(seconds)})</button>
        : <button type="button" className="btn ghost" onClick={start}>🎙 {url ? 'Volver a grabar' : 'Grabar nota de voz'}</button>}
      {url && !recording && <button type="button" className="link" onClick={() => keep(null)}>Quitar</button>}
    </div>
    {url && !recording && <audio controls src={url} style={{ width: '100%' }} />}
    <p className="tag">Cuenta qué vendes, para quién es y qué lo hace especial. Hasta 3 minutos.</p>
  </div>
}
