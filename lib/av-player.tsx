'use client'

import { useEffect, useRef, useState } from 'react'
import { nextOf, type Story } from './av-story'
import { Ghost } from './av-ghost'
import { Diploma } from './av-diploma'
import { PhotoUpload } from './av-upload'

// Reproductor de la aventura: todo corre en el celular con la historia completa (pocos KB), sin pedir nada por capítulo.
// En los capítulos, video y image ya llegan como URL de Cloudinary.
export type PlayerAdventure = {
  slug: string; title: string; description: string; collection: string; character: string; minutes: number
  mission: { title?: string; text?: string; tips?: string[] }; characterImage?: string
}
type Phase = { at: 'cover' } | { at: 'scene'; id: string } | { at: 'mission' } | { at: 'upload' } | { at: 'diploma' } | { at: 'end' }
export const WHATSAPP = 'https://wa.me/51907579197'

export function Player({ adventure: a, story, code, kitsUrl, others, upload }: {
  adventure: PlayerAdventure; story: Story; code: string | null; kitsUrl: string; others: { slug: string; title: string }[]
  upload: { hasPin: boolean; maxMb: number; maxFiles: number } | null // null: sin código de kit o subidas pausadas
}) {
  const [phase, setPhase] = useState<Phase>({ at: 'cover' })
  const [seen, setSeen] = useState<string[]>([])
  const [muted, setMuted] = useState(false)
  const track = (type: 'start' | 'complete' | 'diploma' | 'whatsapp') =>
    navigator.sendBeacon?.('/api/aventuras/eventos', new Blob([JSON.stringify({ slug: a.slug, type, ...(code && { k: code }) })], { type: 'application/json' }))
  const go = (p: Phase) => { setPhase(p); window.scrollTo({ top: 0 }) }
  const toScene = (id: string | 'mission') => {
    if (id === 'mission') { track('complete'); return go({ at: 'mission' }) }
    setSeen(s => s.includes(id) ? s : [...s, id]); go({ at: 'scene', id })
  }
  const first = story.scenes[0]
  const sound = <button className="av-icon" onClick={() => setMuted(m => !m)} aria-pressed={muted} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>{muted ? '🔇' : '🔊'}</button>

  if (phase.at === 'cover') return <main className="av av-night">
    <header className="av-top"><span className="av-logo">TendyPeru</span>{sound}</header>
    <p className="av-eyebrow">{a.collection}</p>
    <Ghost src={a.characterImage} size={180} />
    <h1>{a.title}</h1>
    <p className="av-lead">{a.description}</p>
    <p className="av-meta">⏱ {a.minutes} min · Sin registro</p>
    {first ? <button className="av-btn lg" onClick={() => { track('start'); toScene(first.id) }}>¡Comenzar mi aventura!</button>
      : <p className="av-note">Esta aventura se está preparando. ¡Vuelve pronto!</p>}
    {code && <a className="av-link" href={`/aventuras/mis-fotos?k=${code}`}>Ver mis fotos (adultos)</a>}
    <a className="av-link" href="/aventuras/privacidad">Privacidad</a>
  </main>

  if (phase.at === 'scene') {
    const scene = story.scenes.find(s => s.id === phase.id)!
    return <main className="av av-night">
      <header className="av-top"><span className="av-logo">TendyPeru</span>{sound}</header>
      <div className="av-progress" role="progressbar" aria-label="Avance de la aventura" aria-valuemin={0} aria-valuemax={story.scenes.length} aria-valuenow={seen.length}><span style={{ width: `${Math.min(100, seen.length / story.scenes.length * 100)}%` }} /></div>
      <Scene key={scene.id} scene={scene} muted={muted} onNext={() => toScene(nextOf(story, scene.id))} onChoose={toScene} />
    </main>
  }

  if (phase.at === 'mission') return <main className="av">
    <h1>{a.mission.title || '¡Ahora empieza tu misión!'}</h1>
    <Ghost src={a.characterImage} size={150} />
    <p className="av-lead">{a.mission.text}</p>
    {!!a.mission.tips?.length && <ul className="av-tips">{a.mission.tips.map(t => <li key={t}>💡 {t}</li>)}</ul>}
    <Timer />
    <button className="av-btn lg" onClick={() => go({ at: code && upload ? 'upload' : 'diploma' })}>Terminé mi creación</button>
    <button className="av-btn ghost" onClick={() => first && toScene(first.id)}>🔁 Escuchar nuevamente</button>
  </main>

  if (phase.at === 'upload' && code && upload) return <main className="av">
    <h1>¡Guarda este momento especial!</h1>
    <PhotoUpload code={code} {...upload} onDone={() => go({ at: 'diploma' })} />
  </main>

  if (phase.at === 'diploma') return <main className="av">
    <h1>¡Lo lograste!</h1>
    <Ghost colored src={a.characterImage} size={150} />
    <Diploma title={a.title} collection={a.collection} character={a.character} image={a.characterImage} onDownload={() => track('diploma')} />
    {!code && <p className="av-note">Para guardar fotos de tu creación usa el QR que viene dentro de tu kit.</p>}
    <button className="av-btn ghost" onClick={() => go({ at: 'end' })}>Continuar</button>
  </main>

  return <main className="av">
    <h2>¿Quieres conocer otra aventura?</h2>
    {!!others.length && <ul className="av-others">{others.map(o => <li key={o.slug}><a href={`/aventuras/${o.slug}`}>{o.title}</a></li>)}</ul>}
    <a className="av-btn ghost" href={kitsUrl} target="_blank" rel="noopener">Ver nuevos kits</a>
    <a className="av-btn" href={WHATSAPP} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>💬 Pedir por WhatsApp</a>
    <p className="av-social"><a href="https://instagram.com/tendyperu" target="_blank" rel="noopener">Instagram @tendyperu</a> · <a href="https://www.tiktok.com/@tendy.per" target="_blank" rel="noopener">TikTok @tendy.per</a></p>
    <button className="av-link" onClick={() => go({ at: 'cover' })}>Volver al inicio</button>
  </main>
}

function Scene({ scene, muted, onNext, onChoose }: { scene: Story['scenes'][number]; muted: boolean; onNext: () => void; onChoose: (id: string) => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [ended, setEnded] = useState(false)
  // Se intenta reproducir tras el toque que trajo aquí; si el navegador lo bloquea, quedan los controles.
  useEffect(() => { ref.current?.play().catch(() => {}) }, [])
  const decide = scene.choices.length > 0
  return <section className="av-scene">
    <h1 className="av-scene-title">{scene.title}</h1>
    <video ref={ref} className="av-video" src={scene.video} poster={scene.image ?? undefined} controls playsInline muted={muted} preload="auto"
      onEnded={() => decide ? setEnded(true) : onNext()} />
    {scene.description && <p className="av-caption">{scene.description}</p>}
    {decide && ended ? <div className="av-choices">{scene.choices.map(c => <button key={c.next + c.label} className="av-btn lg" onClick={() => onChoose(c.next)}>{c.label}</button>)}</div>
      : <button className="av-btn ghost" onClick={() => decide ? setEnded(true) : onNext()}>{decide ? 'Ver opciones →' : 'Continuar →'}</button>}
  </section>
}

function Timer() {
  const [sec, setSec] = useState(0)
  const [on, setOn] = useState(false)
  useEffect(() => { if (!on) return; const t = setInterval(() => setSec(s => s + 1), 1000); return () => clearInterval(t) }, [on])
  return <div className="av-timer"><span aria-live="off">⏱ {String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}</span>
    <button className="av-icon" onClick={() => setOn(o => !o)}>{on ? 'Pausar' : sec ? 'Seguir' : 'Temporizador (opcional)'}</button></div>
}
