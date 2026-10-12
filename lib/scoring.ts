// Scoring híbrido: la IA propone sub-scores con evidencia; el backend valida rangos, pesos y suma.
export const VIDEO_DIMS = ['hook', 'pacing', 'clarity', 'emotion', 'cta', 'format', 'trust'] as const
export const CREATIVE_DIMS = ['stop_scroll', 'hierarchy', 'legibility', 'product', 'offer', 'cta', 'trust'] as const

export const SCORE_MODEL_VERSION = 'v1'
const WEIGHTS = {
  video: { hook: 25, pacing: 20, clarity: 15, emotion: 15, cta: 10, format: 10, trust: 5 },
  creative: { stop_scroll: 20, hierarchy: 15, legibility: 15, product: 15, offer: 15, cta: 10, trust: 10 },
} as const

export const LABEL: Record<string, string> = {
  hook: 'Hook / stop-scroll', pacing: 'Ritmo / retención', clarity: 'Claridad del producto', emotion: 'Emoción / relevancia',
  cta: 'CTA', format: 'Formato / plataforma', trust: 'Confianza / autenticidad', stop_scroll: 'Stop-scroll',
  hierarchy: 'Jerarquía visual', legibility: 'Legibilidad móvil', product: 'Producto', offer: 'Oferta',
}
export const DISCLAIMER = 'Indicador creativo de orientación, no una predicción ni una garantía comercial.'

export function score(model: 'video' | 'creative', dims: { name: string; score: number }[]) {
  const w = WEIGHTS[model] as Record<string, number>
  let total = 0
  const out = Object.keys(w).map(k => {
    const d = dims.filter(x => x.name === k)
    if (d.length !== 1) throw new Error(`Dimensión ${k}: se esperaba 1, llegaron ${d.length}`)
    const s = Math.min(100, Math.max(0, Math.round(d[0].score)))
    total += s * w[k]
    return { name: k, score: s, weight: w[k] }
  })
  const overall = Math.round(total / 100)
  return { overall, band: overall < 50 ? 'Bajo' : overall < 75 ? 'Medio' : 'Alto', dimensions: out, score_model_version: SCORE_MODEL_VERSION }
}
