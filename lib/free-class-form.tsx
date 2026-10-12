'use client'

// ponytail: el registro llega solo como mensaje de WhatsApp, no se guarda en BD. Tabla `leads` si hay que exportarlos.
export function FreeClassForm({ whatsapp }: { whatsapp: string }) {
  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const text = `Hola, quiero inscribirme a la clase gratis.\nNombre: ${f.get('name')}\nCelular: ${f.get('phone')}\nQué vendo: ${f.get('product') || '-'}`
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }
  if (!whatsapp) return <small>Configura WHATSAPP_NUMBER</small>
  return (
    <form className="form" onSubmit={send}>
      <label htmlFor="fc-name">Nombre</label>
      <input id="fc-name" name="name" required autoComplete="name" />
      <label htmlFor="fc-phone">Celular</label>
      <input id="fc-phone" name="phone" type="tel" required autoComplete="tel" />
      <label htmlFor="fc-product">¿Qué vendes o quieres vender? (opcional)</label>
      <input id="fc-product" name="product" />
      <button className="btn">Inscribirme gratis por WhatsApp ↗</button>
    </form>
  )
}
