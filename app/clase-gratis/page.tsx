import '../landing.css'
import { FreeClassForm } from '@/lib/free-class-form'
import { Icon } from '@/lib/icons'
import { TOOL_GROUPS, TOOLS } from '@/lib/meta'

// [ícono, título, frase] de cada paso de la clase.
const STEPS = [
  ['buscar', 'Buscar producto', 'Dónde encontrar ideas de productos que la gente ya está comprando.'],
  ['producto', 'Elegir producto', 'Revisa precio, costos y ganancia antes de invertir.'],
  ['video', 'Hacer videos', 'Qué decir y qué mostrar para grabar con tu celular.'],
  ['anuncio', 'Publicar', 'Publica en redes y lanza tus anuncios en Meta y TikTok.'],
  ['whatsapp', 'Vender', 'Atiende por WhatsApp y en vivo hasta cerrar la venta.'],
]

export const metadata = {
  title: 'TendyLab · Clase gratis',
  description: 'Inscríbete gratis a la clase de TendyLab y aprende a vender tu producto en redes con ayuda de la IA.',
}

export default function FreeClass() {
  return (
    <div className="landing sales-landing">
      <header className="nav"><div className="wrap">
        <a className="logo" href="/"><span className="brand-mark" aria-hidden="true">t.</span>Tendy<b>Lab</b></a>
        <a href="#inscripcion" className="btn" style={{ marginLeft: 'auto' }}>Inscribirme gratis</a>
      </div></header>

      <main>
        <section className="sales-hero course-hero" id="inscripcion">
          <div className="wrap course-hero-grid">
            <div className="course-hero-copy">
              <span className="eyebrow">CLASE GRATIS · EN VIVO</span>
              <h1><span className="hl">Aprende a vender</span><br /><em className="hl">tu producto con IA.</em></h1>
              <p>Una clase gratuita para que veas, con ejemplos reales, cómo presentar tu producto, crear contenido y preparar tus anuncios. Déjanos tus datos y te enviamos la fecha y el enlace por WhatsApp.</p>
              <ul className="hero-checks"><li>Gratis</li><li>Desde cero</li><li>Con tu propio producto</li></ul>
            </div>
            <div className="dashboard-tool"><FreeClassForm whatsapp={(process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '')} /></div>
          </div>
        </section>

        <section className="section tint"><div className="wrap">
          <span className="eyebrow">QUÉ VERÁS EN LA CLASE</span>
          <h2>La ruta completa, paso a paso.</h2>
          <ol className="class-steps">{STEPS.map(([icon, title, text], i) => <li key={title}>
            <div className="class-art"><Icon name={icon} /><span>{String(i + 1).padStart(2, '0')}</span></div>
            <h3>{title}</h3><p>{text}</p>
          </li>)}</ol>
        </div></section>

        <section className="section"><div className="wrap">
          <span className="eyebrow">QUÉ PODRÁS HACER</span>
          <h2>Herramientas para aplicarlo<br /><em>en tu negocio.</em></h2>
          <div className="method-grid">
            {TOOL_GROUPS.map(([title, hint, keys]) => <article key={title}><span>{title.toUpperCase()}</span><h3>{hint}.</h3><p>{keys.map(k => TOOLS[k].title).join(' · ')}</p></article>)}
          </div>
        </div></section>

        <section className="cta-band"><div className="wrap">
          <h2>Tu lugar en la clase es gratis.</h2>
          <a className="btn lg light" href="#inscripcion">Inscribirme ahora <span aria-hidden="true">↑</span></a>
        </div></section>
      </main>
      <footer className="foot"><div className="wrap"><a className="logo" href="/">Tendy<b>Lab</b></a><span>Los ejemplos son ilustrativos. Los resultados dependen de cada negocio y no están garantizados.</span><a href="/">Ver TendyLab ↗</a></div></footer>
    </div>
  )
}
