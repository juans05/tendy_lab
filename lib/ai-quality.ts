import { ANGLES } from './hook-angles'
const normalized = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export function uniqueTexts(texts: string[], label: string) {
  const values = texts.map(normalized)
  if (values.some(v => !v) || new Set(values).size !== values.length) throw new Error(`${label}: faltan textos o hay propuestas repetidas. Cambia el concepto, no solo la puntuación.`)
}
export function checkHooks(hooks: { angle: string; text: string }[]) {
  if (hooks.length < 12) throw new Error('Genera al menos 12 hooks.')
  for (const angle of ANGLES) if (hooks.filter(h => h.angle === angle).length < 2) throw new Error(`Faltan dos hooks del ángulo ${angle}.`)
  uniqueTexts(hooks.map(h => h.text), 'Hooks')
}
export function checkDimensions(dimensions: { name: string }[], expected: readonly string[]) {
  if (dimensions.length !== expected.length || new Set(dimensions.map(d => d.name)).size !== expected.length || expected.some(name => !dimensions.some(d => d.name === name))) throw new Error('Devuelve cada dimensión solicitada exactamente una vez.')
}
