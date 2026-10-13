import './landing.css'
import './landing-motion.css'
import { ContentComparison } from '@/lib/content-comparison'
import { currentUser } from '@/lib/auth'
import { CajonCalc } from '@/lib/cajon-calc'
import { CoursePicker } from '@/lib/course-picker'
import { LandingMotion } from '@/lib/landing-motion'
import { coins, COST, FREE_MONTHLY, SIGNUP_GRANT } from '@/lib/credits'
import { TOOL_GROUPS, TOOLS } from '@/lib/meta'
import { mercadoFonts } from '@/lib/mercado-fonts'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'TendyLab · Aprende a vender con ayuda de la IA',
  description: 'Aprende a presentar tu producto, crear contenido con inteligencia artificial y preparar tus anuncios y conversaciones de venta.',
}

const FAQ = [
  ['¿De verdad es gratis?', `Sí. La ruta, las guías y varias herramientas son gratis. Al inscribirte recibes ${coins(SIGNUP_GRANT)} de regalo. Solo las herramientas con IA de imagen, video y análisis usan monedas.`],
  ['¿Me garantizan ventas?', 'No, y desconfía de quien lo prometa. Te enseñamos y te damos herramientas; los resultados dependen de tu producto, tu precio y tu constancia.'],
  ['¿Las clases están dentro de la plataforma?', 'Las clases del curso te enseñan cada paso. La plataforma es tu espacio de trabajo: ahí calculas tus números, creas tus imágenes, guiones y textos, analizas tus videos y llevas tu ruta.'],
  ['¿Cuánto necesito para anuncios?', 'Empiezas con un presupuesto pequeño que puedas permitirte mientras aprendes. En clase te enseñamos a medir cuánto te cuesta cada venta antes de subir la inversión.'],
  ['¿Necesito seguidores para hacer live?', 'Cada plataforma pone sus propios requisitos para transmitir en vivo y los cambia con el tiempo. En clase revisamos los requisitos vigentes y qué hacer si todavía no los cumples.'],
  ['¿Necesito RUC para empezar?', 'Puedes empezar a vender sin él, pero para emitir comprobantes, verificar WhatsApp Business y crecer conviene formalizarte. La guía de RUC 10 te explica cómo.'],
  ['¿Cómo pago las monedas?', 'Por Yape o Plin. Envías la captura por WhatsApp y las activamos en tu cuenta con tu correo.'],
  ['¿Cuánto cuesta cada herramienta?', `Crea una imagen ${coins(COST.imagen)}, Analiza mi video ${coins(COST.video)}, Video a texto ${coins(COST.transcribir)}, Hooks, Guion y Analiza mi creativo ${coins(COST.hooks)}. ¿A cuánto lo vendo? es gratis sin límite; Respuestas para WhatsApp y Copy son gratis hasta ${FREE_MONTHLY} veces al mes. Si un análisis falla, te devolvemos las monedas.`],
  ['¿Qué pasa con mis archivos?', 'Son privados y solo los ves tú. Se eliminan a los 30 días. No los usamos para entrenar modelos propios; se procesan con proveedores de IA únicamente para generar tu resultado.'],
]
// La ruta en tres pasos, impresa como boleta: [paso, qué hacemos, qué incluye]
const METHOD = [
  ['Presenta tu producto', 'Qué vendes, a quién le sirve y por qué lo elegiría. Revisamos la oferta y los números antes de crear el anuncio.', 'Producto + cliente + precio'],
  ['Crea contenido con IA', 'Convertimos esa idea en una imagen, un guion y un texto. Te enseñamos a pedir, elegir y mejorar cada resultado.', 'Imagen + guion + mensaje'],
  ['Prepara anuncios y atención', 'Una oferta comprensible, un llamado a la acción y respuestas para atender. Después, medir y ajustar.', 'Anuncio + conversación + aprendizaje'],
]
const Tape = () => <div className="mk-tape" aria-hidden="true"><span>APRENDE → CREA → VENDE → CRECE</span></div>

export default async function Home() {
  const user = await currentUser()
  const start = user ? '/panel' : '/register'
  const cta = user ? 'Ir a mi panel' : 'Inscríbete gratis'
  return (
    <div className={`landing mercado ${mercadoFonts}`}>
      <header className="mk-nav"><div className="wrap">
        <a className="mk-logo" href="/"><span aria-hidden="true">t.</span>TendyLab</a>
        <nav className="mk-links" aria-label="Secciones"><a href="#metodo">Cómo lo hacemos</a><a href="#curso">El curso</a><a href="#herramientas">Herramientas</a></nav>
        {user ? <a className="mk-ticket sm" href="/panel">Ir a mi panel</a> : <><a href="/login" className="mk-login">Entrar</a><a className="mk-ticket sm" href="/clase-gratis">Clase gratis</a></>}
      </div></header>

      <main>
        <section className="mk-hero"><div className="wrap mk-hero-grid">
          <div className="mk-hero-copy">
            <h1>Aprende a vender tu producto. <em>Con IA.</em></h1>
            <p>Te enseñamos a presentar lo que vendes, crear contenido que capte la atención y preparar tus anuncios. Con ejemplos y herramientas para aplicarlo a tu propio negocio.</p>
            <div className="mk-actions"><a className="mk-ticket lg" href="#curso">Quiero aprender a vender <span aria-hidden="true">→</span></a><a className="mk-link" href="#demo">Ver un ejemplo <span aria-hidden="true">↓</span></a></div>
            <ul className="mk-checks"><li>Desde cero</li><li>Con tu propio producto</li><li>Paso a paso</li></ul>
          </div>
          <figure className="mk-photo">
            <img src="/images/product-studio.webp" alt="Termo naranja sobre un pedestal: ejemplo de foto de producto" width="900" height="1350" fetchPriority="high" />
            <figcaption>Tu producto, todo el foco. <small>Imagen de ejemplo.</small></figcaption>
            <div className="mk-pricetag" aria-hidden="true"><div><small>Hecho en clase</small><b>Foto + guion</b>+ anuncio + respuestas</div></div>
          </figure>
          <span className="mk-sticker" aria-hidden="true">Desde<br />cero</span>
        </div></section>
        <Tape />

        <section className="mk-sec mk-paper" id="metodo"><div className="wrap mk-split">
          <div>
            <h2>Tienes un producto. <span>Ahora toca que lo miren.</span></h2>
            <div className="mk-chats" data-reveal="stagger"><p>“No sé qué publicar.”</p><p>“Muestro mi producto, pero no destaca.”</p><p>“Quiero usar IA, pero no sé por dónde empezar.”</p></div>
            <p className="mk-lead">Te enseñamos a unir una buena idea de venta con contenido que la comunique. Desde tu primer guion hasta la respuesta a un cliente.</p>
          </div>
          <div className="mk-receipt" data-reveal>
            <p className="mk-receipt-head"><b>TendyLab</b><span>Tu ruta en tres pasos</span></p>
            <ol>{METHOD.map(([title, text, items]) => <li key={title}><p className="mk-receipt-line"><b>1 × {title}</b><span aria-hidden="true">✓</span></p><p>{text}</p><small>{items}</small></li>)}</ol>
            <p className="mk-receipt-total"><span>Total</span><b>Tu producto, listo para venderse</b></p>
          </div>
        </div></section>

        <section className="mk-sec mk-navy" id="demo"><div className="wrap">
          <h2>El mismo producto. <span>Otra forma de venderlo.</span></h2>
          <p className="mk-lead">Cambia entre «Antes» y «Con estrategia + IA» y mira qué cambia.</p>
          <div className="mk-demo" data-reveal><ContentComparison /></div>
          <a className="mk-ticket light" href="#curso">Quiero aprender a hacerlo <span aria-hidden="true">→</span></a>
        </div></section>

        <section className="mk-poster"><div className="wrap" data-reveal>
          <p>Una herramienta puede darte mil ideas. <span>El criterio te ayuda a elegir la correcta.</span></p>
          <small>Aprende qué pedirle a la IA, cómo revisar lo que entrega y cómo aplicarlo a tu negocio.</small>
          <a href="#curso">Conoce la ruta del curso <span aria-hidden="true">→</span></a>
        </div></section>

        <section className="mk-sec mk-paper" id="aprendes"><div className="wrap">
          <h2>Ideas que puedes aplicar. <span>Contenido que puedes crear.</span></h2>
          <p className="mk-lead">Trabaja con tu producto y aprende a preparar cada pieza, revisarla y adaptarla a tu marca.</p>
          <div className="mk-shelf" data-reveal="stagger">
            <article className="mk-piece"><div className="mk-art mk-art-photo"><img src="/images/product-studio.webp" alt="Ejemplo de fotografía comercial de producto" width="900" height="1350" loading="lazy" /></div><span className="mk-tag">Imágenes</span><h3>Una imagen que destaque.</h3><p>Aprende a dar contexto, elegir un estilo y revisar el resultado que genera la IA.</p></article>
            <article className="mk-piece"><div className="mk-art mk-art-script"><div><small>Guion · 15 segundos</small><p><b>00–03</b> Una frase que despierte interés.</p><p><b>03–10</b> Muestra el producto en uso.</p><p><b>10–15</b> Invita a dar el siguiente paso.</p></div></div><span className="mk-tag">Videos</span><h3>Un guion para grabar.</h3><p>Organiza qué decir y qué mostrar para grabar con tu celular con una idea clara.</p></article>
            <article className="mk-piece"><div className="mk-art mk-art-copy"><p>Tu pausa del día, <span>con más color.</span></p><small>Consulta los modelos disponibles →</small></div><span className="mk-tag">Publicaciones</span><h3>Un mensaje con intención.</h3><p>Conecta lo que vendes con una necesidad y termina con un llamado a la acción.</p></article>
            <article className="mk-piece"><div className="mk-art mk-art-chat"><p>¡Hola! Me interesa. ¿Cómo lo pido?</p><p>¡Hola! Cuéntame qué modelo buscas y te confirmo los pasos para tu pedido.</p></div><span className="mk-tag">Conversaciones</span><h3>Respuestas para atender.</h3><p>Prepara respuestas claras y adapta la información a las condiciones reales de tu negocio.</p></article>
          </div>
          <div className="mk-plank" aria-hidden="true" />
        </div></section>

        <section className="mk-sec mk-paper-2" id="curso"><div className="wrap">
          <h2>Aprende a hacerlo por tu cuenta.</h2>
          <p className="mk-lead">Del producto al anuncio: una ruta práctica para que sepas qué hacer en cada etapa.</p>
          <div data-reveal><CoursePicker toolNames={Object.fromEntries(Object.entries(TOOLS).map(([k, t]) => [k, t.title]))} /></div>
          <div className="mk-cajon" id="calculadora" data-reveal><CajonCalc /></div>
          <div className="mk-enroll" data-reveal>
            <div>
              <h3>Empieza a ponerlo en práctica.</h3>
              <ol><li><b>Crea tu cuenta gratis.</b> Recibe tus monedas de regalo y completa los datos de tu marca.</li><li><b>Organiza tu producto.</b> Guarda tus referencias y calcula el precio y los costos de tu venta.</li><li><b>Prepara tu contenido.</b> Crea tu guion, imagen y textos, y aplícalos siguiendo lo que aprendes en clase.</li></ol>
              <p>Las clases se realizan fuera de la plataforma.</p>
            </div>
            <a className="mk-ticket lg" href={start}>{user ? cta : 'Crear mi cuenta gratis'} <span aria-hidden="true">→</span></a>
          </div>
        </div></section>

        <section className="mk-sec mk-paper" id="herramientas"><div className="wrap">
          <h2>Elige lo que tu negocio necesita hoy.</h2>
          <p className="mk-lead">Hablan como tu marca y no inventan precios ni plazos.</p>
          <div className="mk-board" data-reveal>
            <p className="mk-board-head"><span>Lista de precios</span><span>En monedas</span></p>
            {TOOL_GROUPS.map(([title, hint, keys]) => <div className="mk-board-group" key={title}>
              <h3>{title} <small>{hint}</small></h3>
              <ul>{keys.map(k => <li key={k}><a href={start}><span>{TOOLS[k].title}</span><i aria-hidden="true" /><b>{COST[k] ? coins(COST[k]) : 'Gratis'}</b></a></li>)}</ul>
            </div>)}
            <p className="mk-board-foot">Al inscribirte recibes {coins(SIGNUP_GRANT)} de regalo.</p>
          </div>
        </div></section>

        <section className="mk-sec mk-navy"><div className="wrap">
          <div className="mk-signs" data-reveal="stagger">
            <div className="mk-sign is-yes"><h3>Es para ti si…</h3><ul><li>Empiezas de cero o recién haces tus primeras ventas</li><li>Vendes o quieres vender por redes y WhatsApp</li><li>Tú mismo creas tu contenido con el celular</li></ul></div>
            <div className="mk-sign is-no"><h3>No es para ti si…</h3><ul><li>Buscas ventas garantizadas sin esfuerzo</li><li>Quieres que alguien lo haga todo por ti</li><li>Esperas hacerte viral de un día para otro</li></ul></div>
          </div>
          <div className="mk-honest" data-reveal>
            <div><h2>Honestos con lo que la IA puede y no puede hacer.</h2><p>Muchas herramientas prometen viralidad. Nosotros te damos criterio para decidir mejor.</p></div>
            <ul>
              <li><b>Puntaje con explicación.</b> Cada número viene con la razón y el momento exacto del video.</li>
              <li><b>Números exactos donde importa.</b> Las cuentas de precio y del cajón las hace el sistema, no la IA.</li>
              <li><b>No inventamos precios ni plazos.</b> Si falta un dato en tus textos, te lo marcamos para que lo completes.</li>
            </ul>
          </div>
        </div></section>

        <section className="mk-sec mk-paper" id="preguntas"><div className="wrap mk-faq">
          <h2>Preguntas frecuentes</h2>
          <div>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div></section>

        <section className="mk-close"><div className="wrap" data-reveal>
          <h2>Tu producto tiene potencial. <em>Aprende a venderlo.</em></h2>
          <p>Empieza a aplicar lo que aprendes. Crea tu cuenta y prepara el próximo contenido de tu negocio.</p>
          <a className="mk-ticket lg" href={start}>{cta} <span aria-hidden="true">→</span></a>
        </div></section>
        <Tape />
      </main>
      <LandingMotion />
      <footer className="mk-foot"><div className="wrap"><a className="mk-logo" href="/"><span aria-hidden="true">t.</span>TendyLab</a><p>Los ejemplos son ilustrativos. Los resultados dependen de cada negocio y no están garantizados.</p><a href="/login">Entrar a mi cuenta →</a></div></footer>
    </div>
  )
}
