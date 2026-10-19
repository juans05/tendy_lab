// Una historia es una lista de capítulos en orden (el primero es el inicio). Por defecto se recorre en orden;
// las opciones (2 o 3) y el "capítulo siguiente" son opcionales y permiten ramas.
export type Choice = { label: string; next: string }
export type Scene = {
  id: string; title: string; video: string; description?: string | null; image?: string | null
  next?: string | null; ending: boolean; choices: Choice[]
}
export type Story = { scenes: Scene[] }

// Adónde va un capítulo sin opciones cuando termina su video.
export function nextOf(story: Story, sceneId: string): string | 'mission' {
  const i = story.scenes.findIndex(s => s.id === sceneId)
  const s = story.scenes[i]
  if (!s || s.ending) return 'mission'
  if (s.next) return s.next
  return story.scenes[i + 1]?.id ?? 'mission'
}

const exits = (story: Story, s: Scene) => s.choices.length ? s.choices.map(c => c.next) : [nextOf(story, s.id)]

export function validateStory(story: Story): { errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = []
  if (!story.scenes.length) return { errors: ['Agrega al menos un capítulo.'], warnings }
  const ids = new Set(story.scenes.map(s => s.id))
  for (const s of story.scenes) {
    const name = s.title.trim() || 'Capítulo sin título'
    if (!s.title.trim()) errors.push(`${name}: falta el título.`)
    if (!s.video.trim()) errors.push(`${name}: falta el video.`)
    if (s.choices.length && (s.choices.length < 2 || s.choices.length > 3)) errors.push(`${name}: las decisiones deben ser 2 o 3 opciones.`)
    if (s.choices.some(c => !ids.has(c.next))) errors.push(`${name}: una opción lleva a un capítulo que no existe.`)
    if (!s.choices.length && s.next && !ids.has(s.next)) errors.push(`${name}: el capítulo siguiente no existe.`)
  }
  if (errors.length) return { errors, warnings }

  // Alcanzables desde el inicio.
  const byId = new Map(story.scenes.map(s => [s.id, s]))
  const seen = new Set<string>([story.scenes[0].id]), queue = [story.scenes[0].id]
  while (queue.length) for (const n of exits(story, byId.get(queue.shift()!)!))
    if (n !== 'mission' && !seen.has(n)) { seen.add(n); queue.push(n) }
  // Los que llegan a la misión: punto fijo hacia atrás.
  const ok = new Set<string>()
  for (let changed = true; changed;) {
    changed = false
    for (const s of story.scenes) if (!ok.has(s.id) && exits(story, s).some(n => n === 'mission' || ok.has(n))) { ok.add(s.id); changed = true }
  }
  for (const s of story.scenes) {
    if (!seen.has(s.id)) warnings.push(`${s.title}: ningún camino llega a este capítulo.`)
    else if (!ok.has(s.id)) errors.push(`${s.title}: desde aquí la historia da vueltas sin llegar a un final.`)
  }
  return { errors, warnings }
}
