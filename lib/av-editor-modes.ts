import type { Scene } from './av-story'

// Una sola pregunta en el editor: "¿Qué pasa al terminar el video?". Traduce entre esa respuesta y los campos del capítulo.
export type EndMode = 'next' | 'choose' | 'jump' | 'end'

export function endMode(s: Scene): EndMode {
  if (s.choices.length) return 'choose'
  if (s.ending) return 'end'
  return s.next ? 'jump' : 'next'
}

export function applyEndMode(s: Scene, mode: EndMode, scenes: Scene[]): Scene {
  const others = scenes.filter(x => x.id !== s.id).map(x => x.id)
  const base = { ...s, choices: [], next: null, ending: false }
  if (mode === 'end') return { ...base, ending: true }
  if (mode === 'jump') return { ...base, next: s.next ?? others[0] ?? null }
  if (mode === 'choose') return { ...base, choices: s.choices.length ? s.choices
    : [0, 1].map(i => ({ label: '', next: others[i] ?? others[0] })).filter(c => c.next) }
  return base
}
