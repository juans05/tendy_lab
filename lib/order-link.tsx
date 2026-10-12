'use client'
import { useEffect, useState } from 'react'
import { CopyText } from './copy-text'
export function OrderLink({ token }: { token: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => setUrl(`${window.location.origin}/pedido/${token}`), [token])
  return <div className="share-order"><input aria-label="Enlace para tus clientes" readOnly value={url} /><CopyText text={url} /><a href={`/pedido/${token}`} target="_blank" rel="noopener">Vista previa ↗</a></div>
}
