'use client'

import { useState } from 'react'

// El PIN temporal se ve una sola vez aquí; el admin lo envía por WhatsApp al comprador verificado.
export function ResetPin() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  async function submit(form: HTMLFormElement) {
    const r = await fetch('/api/admin/aventuras/qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: new FormData(form).get('code') }) })
    const j = await r.json().catch(() => ({}))
    setMsg(r.ok ? { ok: true, text: `PIN temporal de ${j.code}: ${j.pin} — envíalo por WhatsApp. No se volverá a mostrar.` } : { ok: false, text: j.error ?? 'No se pudo resetear.' })
    form.reset()
  }
  return <form className="form" onSubmit={e => { e.preventDefault(); submit(e.currentTarget) }}>
    <h3>Resetear PIN de un kit</h3>
    <p className="tag">Antes confirma por WhatsApp que es el comprador (foto del QR del kit o número de pedido).</p>
    <div className="av-row"><input name="code" required placeholder="TP-XXXXXXXX" aria-label="Código del kit" style={{ maxWidth: 240 }} /><button>Generar PIN temporal</button></div>
    {msg && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.text}</p>}
  </form>
}
