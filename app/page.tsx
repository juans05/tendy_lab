import './landing.css'
import './landing-motion.css'
import { ContentComparison } from '@/lib/content-comparison'
import { currentUser } from '@/lib/auth'
import { CajonCalc } from '@/lib/cajon-calc'
import { CoursePicker } from '@/lib/course-picker'
import { LandingMotion } from '@/lib/landing-motion'
import { coins, COST, FREE_MONTHLY, SIGNUP_GRANT } from '@/lib/credits'
import { Icon } from '@/lib/icons'
import { TOOL_GROUPS, TOOLS } from '@/lib/meta'

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

export default async function Home() {
  const user = await currentUser()
  const start = user ? '/panel' : '/register'
  const cta = user ? 'Ir a mi panel' : 'Inscríbete gratis'
  return (
    <div className="landing sales-landing">
      <header className="nav"><div className="wrap">
        <a className="logo" href="/"><span className="brand-mark" aria-hidden="true">t.</span>Tendy<b>Lab</b></a>
        <nav className="links" aria-label="Secciones">
          <a href="#metodo">Cómo lo hacemos</a><a href="#demo">Mira el cambio</a><a href="#aprendes">Qué aprenderás</a><a href="#curso">El curso</a><a href="/clase-gratis">Clase gratis</a>
        </nav>
        {user ? <a className="btn" href="/panel">Ir a mi panel</a> : <><a href="/login" className="nav-login">Entrar</a><a className="btn" href="/register">Inscríbete gratis</a></>}
      </div></header>

      <main>
        <section className="sales-hero course-hero">
          <div className="wrap course-hero-grid">
            <div className="course-hero-copy">
              <span className="eyebrow">TU PRODUCTO + ESTRATEGIA + INTELIGENCIA ARTIFICIAL</span>
              <h1><span className="hl">Aprende a vender</span><br /><span className="hl">tu producto en redes</span><br /><em className="hl">con ayuda de la IA.</em></h1>
              <p>Te enseñamos a presentar lo que vendes, crear contenido que capte la atención y preparar tus anuncios. Con ejemplos y herramientas para aplicarlo a tu propio negocio.</p>
              <div className="sales-hero-actions"><a className="btn lg" href="#curso">Quiero aprender a vender <span aria-hidden="true">↗</span></a><a href="#demo" className="hero-proof-link">Ver un ejemplo <span aria-hidden="true">↓</span></a></div>
              <ul className="hero-checks"><li>Desde cero</li><li>Con tu propio producto</li><li>Paso a paso</li></ul>
            </div>
            <div className="phone-stage">
              <span className="phone-note">Así puede verse<br /><em>tu próxima publicación ↘</em></span>
              <div className="ad-phone"><div className="phone-island" aria-hidden="true" /><div className="phone-account"><span>t.</span><div><b>Tu marca</b><small>Ejemplo de contenido</small></div><span aria-hidden="true">•••</span></div><div className="phone-image"><img src="/images/product-studio.webp" alt="Anuncio de ejemplo: termo naranja con el mensaje Dale color a tu día" width="900" height="1350" fetchPriority="high" /><div>Dale color<br />a tu día.<small>Haz de tu pausa un buen momento.</small></div></div><div className="phone-caption"><b>Una idea. Una imagen. Un mensaje.</b><p>Escríbenos “COLOR” y consulta los modelos disponibles.</p><span>Enviar mensaje <i aria-hidden="true">↗</i></span></div></div>
              <div className="phone-sticker"><span aria-hidden="true">✦</span><div><b>La IA ayuda a crear.</b><small>Tú aprendes a dirigirla.</small></div></div>
              <p className="phone-disclaimer">Composición ilustrativa. No es un anuncio en circulación.</p>
            </div>
          </div>
          <div className="wrap"><div className="hero-signature"><span>APRENDE</span><i aria-hidden="true">→</i><span>CREA</span><i aria-hidden="true">→</i><span>VENDE</span><i aria-hidden="true">→</i><span>CRECE</span></div></div>
        </section>

        <section className="sales-intro section" id="beneficios"><div className="wrap intro-layout">
          <div><span className="eyebrow">¿TE SUENA FAMILIAR?</span><h2>Tienes un producto.<br />Ahora toca hacer<br /><em>que lo miren.</em></h2></div>
          <div className="pain-list" data-reveal="stagger"><p><span>01</span> “No sé qué publicar.”</p><p><span>02</span> “Muestro mi producto, pero no destaca.”</p><p><span>03</span> “Quiero usar IA, pero no sé por dónde empezar.”</p><div>Te enseñamos a unir una buena idea de venta con contenido que la comunique. Desde tu primer guion hasta la respuesta a un cliente.</div></div>
        </div></section>

        <section className="section sales-method" id="metodo"><div className="wrap">
          <span className="eyebrow">TU RUTA EN TRES PASOS</span><h2>De tener un producto<br /><em>a saber cómo ofrecerlo.</em></h2>
          <div className="method-grid" data-reveal="stagger">
            <article><span>01 / ENTENDER</span><h3>Presenta<br />tu producto.</h3><p>Qué vendes, a quién le sirve y por qué lo elegiría. Revisamos la oferta y los números antes de crear el anuncio.</p><small>Producto + cliente + precio</small></article>
            <article><span>02 / CREAR</span><h3>Crea contenido<br />con IA.</h3><p>Convertimos esa idea en una imagen, un guion y un texto. Te enseñamos a pedir, elegir y mejorar cada resultado.</p><small>Imagen + guion + mensaje</small></article>
            <article><span>03 / VENDER</span><h3>Prepara anuncios<br />y atención.</h3><p>Una oferta comprensible, un llamado a la acción y respuestas para atender. Después, medir y ajustar.</p><small>Anuncio + conversación + aprendizaje</small></article>
          </div>
        </div></section>

        <section className="section sales-demo" id="demo"><div className="wrap">
          <div className="demo-heading"><div><span className="eyebrow">TE LO MOSTRAMOS CON UN EJEMPLO</span><h2>El mismo producto.<br /><em>Otra forma de venderlo.</em></h2></div><span className="demo-scribble">Mira qué cambia ↙</span></div>
          <div data-reveal><ContentComparison /></div>
          <div className="course-section-cta"><a className="btn" href="#curso">Quiero aprender a hacerlo <span aria-hidden="true">↗</span></a></div>
        </div></section>

        <section className="sales-manifesto"><div className="wrap" data-reveal><span className="eyebrow">NUESTRA FORMA DE ENSEÑAR</span><p>Una herramienta puede darte mil ideas.<br /><em>El criterio te ayuda a elegir la correcta.</em></p><span>Aprende qué pedirle a la IA, cómo revisar lo que entrega y cómo aplicarlo a tu negocio.</span><a href="#curso">Conoce la ruta del curso <span aria-hidden="true">↗</span></a></div></section>

        <section className="section learning-output" id="aprendes"><div className="wrap">
          <span className="eyebrow">LO QUE APRENDES SE CONVIERTE EN ALGO CONCRETO</span>
          <h2>Ideas que puedes aplicar.<br /><em>Contenido que puedes crear.</em></h2>
          <p className="sub">Trabaja con tu producto y aprende a preparar cada pieza, revisarla y adaptarla a tu marca.</p>
          <div className="learning-grid" data-reveal="stagger">
            <article><div className="learning-preview preview-image"><img src="/images/product-studio.webp" alt="Ejemplo de fotografía comercial de producto" width="900" height="1350" loading="lazy" /><span>TU PRODUCTO,<br />TODO EL FOCO.</span></div><div className="learning-copy"><span>01 / IMÁGENES</span><h3>Una imagen que destaque.</h3><p>Aprende a dar contexto, elegir un estilo y revisar el resultado que genera la IA.</p></div></article>
            <article><div className="learning-preview preview-script"><div><small>GUION · 15 SEGUNDOS</small><p><b>00–03</b> Una frase que despierte interés.</p><p><b>03–10</b> Muestra el producto en uso.</p><p><b>10–15</b> Invita a dar el siguiente paso.</p></div></div><div className="learning-copy"><span>02 / VIDEOS</span><h3>Un guion para grabar.</h3><p>Organiza qué decir y qué mostrar para grabar con tu celular con una idea clara.</p></div></article>
            <article><div className="learning-preview preview-copy"><div><small>TU PRÓXIMA PUBLICACIÓN</small><p>Tu pausa del día,<br /><em>con más color.</em></p><span>Consulta los modelos disponibles ↗</span></div></div><div className="learning-copy"><span>03 / PUBLICACIONES</span><h3>Un mensaje con intención.</h3><p>Conecta lo que vendes con una necesidad y termina con un llamado a la acción.</p></div></article>
            <article><div className="learning-preview preview-reply"><p>¡Hola! Me interesa. ¿Cómo lo pido?</p><p>¡Hola! Cuéntame qué modelo buscas y te confirmo los pasos para tu pedido.</p></div><div className="learning-copy"><span>04 / CONVERSACIONES</span><h3>Respuestas para atender.</h3><p>Prepara respuestas claras y adapta la información a las condiciones reales de tu negocio.</p></div></article>
          </div>
          <div className="course-section-cta"><a className="btn lg" href="#curso">Quiero aprender a vender <span aria-hidden="true">↗</span></a></div>
        </div></section>

        <section className="section" id="curso"><div className="wrap">
          <span className="eyebrow">EL CURSO</span>
          <h2>Aprende a hacerlo por tu cuenta.</h2>
          <p className="sub">Del producto al anuncio: una ruta práctica para que sepas qué hacer en cada etapa.</p>
          <div data-reveal><CoursePicker toolNames={Object.fromEntries(Object.entries(TOOLS).map(([k, t]) => [k, t.title]))} /></div>
          <div className="course-enrollment" data-reveal><div><b>Empieza a ponerlo en práctica.</b><p>Crea tu cuenta gratuita para organizar tu producto y explorar las herramientas. Las clases se realizan fuera de la plataforma.</p></div><a className="btn" href={start}>{user ? cta : 'Crear mi cuenta gratis'} <span aria-hidden="true">↗</span></a></div>
        </div></section>

        <section className="section" id="calculadora"><div className="wrap" data-reveal><CajonCalc /></div></section>

        <section className="section tint" id="como-funciona"><div className="wrap">
          <span className="eyebrow">CÓMO FUNCIONA</span>
          <h2>Tu primer paso es más sencillo de lo que parece.</h2>
          <ol className="steps" data-reveal="stagger">
            <li><h3>Crea tu cuenta gratis</h3><p>Recibe tus monedas de regalo y completa los datos de tu marca.</p></li>
            <li><h3>Organiza tu producto</h3><p>Guarda tus referencias y calcula el precio y los costos de tu venta.</p></li>
            <li><h3>Prepara tu contenido</h3><p>Crea tu guion, imagen y textos. Revísalos y aplícalos siguiendo lo que aprendes en clase.</p></li>
          </ol>
        </div></section>

        <section className="section" id="herramientas"><div className="wrap">
          <span className="eyebrow">HERRAMIENTAS PARA TU NEGOCIO</span>
          <h2>Elige lo que tu negocio necesita hoy.</h2>
          <p className="sub">Hablan como tu marca y no inventan precios ni plazos.</p>
          {TOOL_GROUPS.map(([title, hint, keys]) => <div key={title} className="landing-group" data-reveal><h3>{title} <small>{hint}</small></h3>
            <div className="landing-tools">{keys.map(k => <a key={k} href={start}><Icon name={k} /><b>{TOOLS[k].title}</b><span>{COST[k] ? coins(COST[k]) : 'Gratis'}</span></a>)}</div></div>)}
        </div></section>

        <section className="section tint"><div className="wrap fit" data-reveal="stagger">
          <div className="yes"><h3>✓ Es para ti si…</h3><ul><li>Empiezas de cero o recién haces tus primeras ventas</li><li>Vendes o quieres vender por redes y WhatsApp</li><li>Tú mismo creas tu contenido con el celular</li></ul></div>
          <div className="no"><h3>✕ No es para ti si…</h3><ul><li>Buscas ventas garantizadas sin esfuerzo</li><li>Quieres que alguien lo haga todo por ti</li><li>Esperas hacerte viral de un día para otro</li></ul></div>
        </div></section>

        <section className="section"><div className="wrap trust" data-reveal>
          <div>
            <h2>Honestos con lo que la IA puede y no puede hacer</h2>
            <p className="sub" style={{ marginBottom: 0 }}>Muchas herramientas prometen viralidad. Nosotros te damos criterio para decidir mejor.</p>
          </div>
          <ul>
            <li><b>Puntaje con explicación.</b> Cada número viene con la razón y el momento exacto del video.</li>
            <li><b>Números exactos donde importa.</b> Las cuentas de precio y del cajón las hace el sistema, no la IA.</li>
            <li><b>No inventamos precios ni plazos.</b> Si falta un dato en tus textos, te lo marcamos para que lo completes.</li>
          </ul>
        </div></section>

        <section className="section" id="preguntas"><div className="wrap faq">
          <h2>Preguntas frecuentes</h2>
          <div style={{ marginTop: 20 }}>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div></section>

        <section className="cta-band"><div className="wrap" data-reveal>
          <span className="eyebrow">TU PRIMER PASO</span>
          <h2>Tu producto tiene potencial. Aprende a venderlo.</h2>
          <p>Empieza a aplicar lo que aprendes. Crea tu cuenta y prepara el próximo contenido de tu negocio.</p>
          <a className="btn lg light" href={start}>{cta} <span aria-hidden="true">↗</span></a>
        </div></section>
      </main>
      <LandingMotion />
      <footer className="foot"><div className="wrap"><a className="logo" href="/">Tendy<b>Lab</b></a><span>Los ejemplos son ilustrativos. Los resultados dependen de cada negocio y no están garantizados.</span><a href="/login">Entrar a mi cuenta ↗</a></div></footer>
    </div>
  )
}
