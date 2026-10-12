import { requireUser } from '@/lib/auth'
import { balance, coins, fmt, FREE_CAPPED, FREE_MONTHLY } from '@/lib/credits'
import { Icon } from '@/lib/icons'
import { TOOL_GROUPS, TOOLS, toolCost } from '@/lib/meta'

export default async function Dashboard() {
  const user = await requireUser()
  const b = await balance(user.id)
  const shown = TOOL_GROUPS.flatMap(g => g[2])
  const name = user.brand.name || user.email.split('@')[0]
  const benefits: Record<keyof typeof TOOLS, [string, string]> = { // tipado por herramienta: si falta una, no compila
    imagen: ['Tu idea, con un diseño que habla como tu marca.', '7 pasos · Imagen · Prompt para copiar'],
    imagen3d: ['Tu producto con volumen, listo para destacar.', '2 a 3 fotos · Imagen 3D · Video de 8 s'],
    video3d: ['Tu producto girando en un video corto.', '2 a 3 fotos · Video de 8 s'],
    transcribir: ['Convierte lo que escuchas en ideas para tu marca.', 'Video · Texto con tiempos · Parafrasear'],
    guion: ['Qué decir y qué grabar, escena por escena.', '15, 30 o 60 segundos · Tu marca'],
    foto: ['Dale a tu producto un fondo listo para vender.', 'Catálogo · Anuncio · Descarga'],
    video: ['Haz que los primeros segundos cuenten.', 'Hook · Ritmo · Claridad'],
    hooks: ['Dale a tu producto un gran comienzo.', '12+ ideas · Diferentes ángulos'],
    creativo: ['Un anuncio que se entienda de un vistazo.', 'Oferta · Diseño · Llamado a la acción'],
    whatsapp: ['Responde rápido y vende sin inventar condiciones.', 'Precio · Envío · Objeciones · Seguimiento'],
    copy: ['El texto que acompaña a tu mejor hook.', '3 captions · Hashtags · Primer comentario'],
    profit: ['Vender más empieza por conocer tus números.', 'Margen · CAC · ROAS'],
  }
  return (
    <>
      <div className="greet">
        <div>
          <span className="eyebrow">BIENVENIDO A TU LABORATORIO</span>
          <h1>Hola, {name} <span className="greet-spark" aria-hidden="true">✦</span><br />Hagamos crecer tu próxima idea.</h1>
          <p className="muted">¿Qué quieres mejorar hoy? Elige tu punto de partida.</p>
        </div>
        <div className="balance">
          <span>Tus monedas</span><b>{fmt(b)}</b>
          <a href="/panel/buy">Comprar monedas ↗</a>
        </div>
      </div>
      <div className="dashboard-guide"><span className="guide-symbol" aria-hidden="true">↗</span><div><b>De tu contenido a un plan de acción.</b><p>Sube tu material, descubre qué mejorar y empieza por lo que más importa.</p></div><span className="guide-steps">01 Elige <span>→</span> 02 Analiza <span>→</span> 03 Mejora</span></div>
      <a className="ecommerce-entry" href="/panel/products"><div><span className="eyebrow">NUEVO · TU RUTA ECOMMERCE</span><h2>De encontrar un producto a preparar tu venta.</h2><p>Organiza tus referencias, hooks, publicaciones y seguimiento en nueve pasos y 4 semanas.</p></div><span aria-hidden="true">↗</span></a>
      <div className="tools-heading"><h2>Tus herramientas para crear y vender</h2><span>{shown.length} formas de avanzar</span></div>
        {TOOL_GROUPS.map(([title, hint, keys]) => <section key={title} className="tool-group"><div className="tools-heading"><h3>{title}</h3><span>{hint}</span></div><div className="tools">{keys.map(k => (
          <a key={k} href={`/panel/tools/${k}`} className={`dashboard-tool tool-${k}`}>
            <div className="tool-card-top"><Icon name={k} /><span className="tool-credit">{toolCost(k) ? coins(toolCost(k)) : FREE_CAPPED.includes(k) ? `Gratis · ${FREE_MONTHLY} al mes` : 'Gratis'}</span></div>
            <h3>{TOOLS[k].title}</h3>
            <p>{benefits[k][0]}</p>
            <div className={`tool-art art-${k}`} aria-hidden="true">{k === 'video' || k === 'transcribir' ? <><span className="art-play">▶</span><span className="art-timeline"><i /><i /><i /><i /><i /></span></> : k === 'hooks' ? <><span>¿Y si empiezas así?</span><span>Tu próxima gran idea ✦</span></> : k === 'creativo' ? <><span className="art-ad"><i /><b>Tu producto.<br />Todo el foco.</b></span><span className="art-check">✓</span></> : k === 'imagen3d' ? <><span className="art-frame"><i /><b /></span><span className="art-spark">3D</span></> : k === 'imagen' ? <><span className="art-frame"><i /><b /></span><span className="art-spark">✦</span></> : k === 'guion' ? <span className="art-script"><span><em>0–5 s</em><i /></span><span><em>5–15 s</em><i /></span><span><em>15–30 s</em><i /></span></span> : k === 'copy' ? <span className="art-caption"><b>Olvídate de la plancha ✦</b><i /><i /><em>#AlgodonPima #HechoEnPeru</em></span> : k === 'whatsapp' ? <span className="art-chat"><span>¿Precio? 👀</span><span>S/ 45 · ¿Qué talla buscas?</span></span> : <><span className="art-chart"><i /><i /><i /><i /></span><span className="art-profit">Conoce tu margen ↗</span></>}</div>
            <span className="tool-features">{benefits[k][1]}</span><div className="tool-card-bottom"><b>{k === 'profit' ? 'Calcular rentabilidad' : 'Empezar ahora'}</b><span aria-hidden="true">↗</span></div>
          </a>
        ))}</div></section>)}
      {!user.brand.name && <div className="note">Completa tu <a href="/panel/brand">perfil de marca</a> una sola vez y todas las herramientas hablarán como tu negocio.</div>}
    </>
  )
}
