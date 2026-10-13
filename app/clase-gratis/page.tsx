import '../landing.css'
import { FreeClassForm } from '@/lib/free-class-form'
import { Icon } from '@/lib/icons'
import { TOOL_GROUPS, TOOLS } from '@/lib/meta'
import { mercadoFonts } from '@/lib/mercado-fonts'

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
    <div className={`landing mercado ${mercadoFonts}`}>
      <header className="mk-nav"><div className="wrap">
        <a className="mk-logo" href="/"><span aria-hidden="true">t.</span>TendyLab</a>
        <a href="#inscripcion" className="mk-ticket sm mk-push">Inscribirme gratis</a>
      </div></header>

      <main>
        <section className="mk-hero" id="inscripcion"><div className="wrap mk-hero-grid">
          <div className="mk-hero-copy">
            <span className="mk-stamp">Clase gratis · En vivo</span>
            <h1>Aprende a vender <em>tu producto con IA.</em></h1>
            <p>Una clase gratuita para que veas, con ejemplos reales, cómo presentar tu producto, crear contenido y preparar tus anuncios. Déjanos tus datos y te enviamos la fecha y el enlace por WhatsApp.</p>
            <ul className="mk-checks"><li>Gratis</li><li>Desde cero</li><li>Con tu propio producto</li></ul>
          </div>
          <div className="mk-formcard"><FreeClassForm whatsapp={(process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '')} /></div>
        </div></section>
        <div className="mk-tape" aria-hidden="true"><span>APRENDE → CREA → VENDE → CRECE</span></div>

        <section className="mk-sec mk-paper"><div className="wrap">
          <h2>La ruta completa, <span>paso a paso.</span></h2>
          <ol className="mk-route">{STEPS.map(([icon, title, text]) => <li key={title}><Icon name={icon} /><h3>{title}</h3><p>{text}</p></li>)}</ol>
        </div></section>

        <section className="mk-sec mk-navy"><div className="wrap">
          <h2>Herramientas para aplicarlo <span>en tu negocio.</span></h2>
          <div className="mk-signs is-three">
            {TOOL_GROUPS.map(([title, hint, keys]) => <div className="mk-sign" key={title}><h3>{title}</h3><p>{hint}.</p><ul>{keys.map(k => <li key={k}>{TOOLS[k].title}</li>)}</ul></div>)}
          </div>
        </div></section>

        <section className="mk-close"><div className="wrap">
          <h2>Tu lugar en la clase <em>es gratis.</em></h2>
          <a className="mk-ticket lg" href="#inscripcion">Inscribirme ahora <span aria-hidden="true">↑</span></a>
        </div></section>
      </main>
      <footer className="mk-foot"><div className="wrap"><a className="mk-logo" href="/"><span aria-hidden="true">t.</span>TendyLab</a><p>Los ejemplos son ilustrativos. Los resultados dependen de cada negocio y no están garantizados.</p><a href="/">Ver TendyLab →</a></div></footer>
    </div>
  )
}
