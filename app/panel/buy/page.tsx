import { requireUser } from '@/lib/auth'
import { FREE_MONTHLY, PACKS } from '@/lib/credits'

// ponytail: pago manual por Yape/Plin; el admin acredita en /admin. Pasarela cuando el volumen lo justifique.
const PAY_NUMBER = process.env.PAY_NUMBER || '(configura PAY_NUMBER)'
const WHATSAPP = process.env.WHATSAPP_NUMBER || ''

export default async function Buy() {
  const user = await requireUser()
  const wa = (p: { credits: number; soles: number }) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, pagué S/${p.soles} por ${p.credits} monedas. Mi correo: ${user.email}`)}`
  return (
    <>
      <h1>Comprar monedas</h1>
      <p className="muted">La plataforma es gratis: solo pagas las monedas que uses. Paga por Yape o Plin al <b>{PAY_NUMBER}</b> y envíanos la captura por WhatsApp. Las activamos con tu correo <b>{user.email}</b>.</p>
      <div className="tools">
        {PACKS.map(p => (
          <div key={p.credits} className="dashboard-tool">
            <span className="eyebrow">RECARGA</span>
            <h3>{p.credits} monedas</h3>
            <p><b>S/ {p.soles}</b> · S/ {(p.soles / p.credits).toFixed(2)} por moneda</p>
            {WHATSAPP ? <a className="btn" href={wa(p)} target="_blank" rel="noreferrer">Ya pagué, enviar comprobante ↗</a> : <small>Configura WHATSAPP_NUMBER</small>}
          </div>
        ))}
      </div>
      <p className="note"><b>Gratis siempre:</b> la Ruta, las guías y ¿A cuánto lo vendo? sin límite; Respuestas para WhatsApp y Copy para publicar hasta {FREE_MONTHLY} veces al mes cada una.</p>
    </>
  )
}
