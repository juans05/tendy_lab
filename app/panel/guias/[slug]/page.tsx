import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { GUIDES, type Guide } from '@/lib/guides'

export default async function Guia({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser()
  const { slug } = await params
  const g: Guide | undefined = Object.hasOwn(GUIDES, slug) ? GUIDES[slug as keyof typeof GUIDES] : undefined
  if (!g) notFound()
  return <><a className="tool-back" href="/panel/products">← Mi ruta ecommerce</a>
    <span className="eyebrow">GUÍA DE LA RUTA</span><h1>{g.icon} {g.title}</h1><p className="muted">{g.summary}</p>
    <section className="card"><h2>Por qué importa</h2><p>{g.why}</p></section>
    {g.video && <section className="card"><iframe src={g.video} title={g.title} style={{ width: '100%', aspectRatio: '16/9', border: 0, borderRadius: 12 }} allowFullScreen /></section>}
    <section className="card"><h2>Paso a paso</h2><ol className="guide-list">{g.steps.map(s => <li key={s}>{s}</li>)}</ol></section>
    <section className="card"><h2>Errores comunes</h2><ul className="get">{g.mistakes.map(m => <li key={m}>{m}</li>)}</ul></section>
    <p className="tag">Fuentes oficiales: {g.sources.map(([n, u], i) => <span key={u}>{i ? ' · ' : ''}<a href={u} target="_blank" rel="noopener noreferrer">{n} ↗</a></span>)}. Los trámites y políticas cambian: verifica siempre en la fuente.</p>
  </>
}
