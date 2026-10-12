'use client'
import { useState } from 'react'
export function CopyText({ text }: { text: string }) {
  const [status, setStatus] = useState('Copiar texto')
  return <button type="button" className="link" onClick={async () => { try { await navigator.clipboard.writeText(text); setStatus('Copiado ✓') } catch { setStatus('Selecciona el texto para copiar') } }}><span aria-live="polite">{status}</span></button>
}
