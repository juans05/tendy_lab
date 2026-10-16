import { z } from 'zod'
import { uniqueTexts } from './ai-quality'
import { checkGrounded } from './selling'

// Mi semana de contenido: una plataforma por plan (publicaciones orgánicas, sin Meta Ads ni Multicanal).
export const PLAN_PLATFORMS = ['Instagram', 'TikTok', 'Facebook'] as const
export type PlanPlatform = typeof PLAN_PLATFORMS[number]
const ALL_FORMATS = ['Reel', 'Carrusel', 'Historia', 'Foto'] as const
export const FORMATS: Record<PlanPlatform, readonly string[]> = { Instagram: ALL_FORMATS, Facebook: ALL_FORMATS, TikTok: ['Reel', 'Carrusel'] }

// Índices 0–6 de los días que publican, repartidos parejo (3 → días 1, 3 y 5).
export const spreadDays = (n: number) => Array.from({ length: n }, (_, i) => Math.floor((i * 7) / n))
// La semana corre en hora de Perú: "hoy" cambia a medianoche de Lima.
export const limaToday = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(now)
export const dayIndex = (start: string, today: string) => Math.round((Date.parse(today) - Date.parse(start)) / 86_400_000)

const str = (min: number, max: number) => z.string().trim().min(min).max(max)
export const Post = z.object({
  format: z.enum(ALL_FORMATS), topic: str(5, 120), hook: str(10, 200),
  shots: z.array(str(5, 160)).min(1).max(3), caption: str(20, 1200),
  hashtags: z.array(z.string().regex(/^#[\p{L}\p{N}_]+$/u)).min(3).max(8),
})
export type Post = z.infer<typeof Post>
export const WeekOut = z.object({ plan_name: str(3, 60), product_context: str(40, 1500), posts: z.array(Post).min(1).max(7) })

export function checkWeek(o: z.infer<typeof WeekOut>, ctx: { days: number; platform: PlanPlatform; prevTopics: string[]; facts: string }) {
  if (o.posts.length !== ctx.days) throw new Error(`Crea exactamente ${ctx.days} publicaciones.`)
  const bad = o.posts.find(p => !FORMATS[ctx.platform].includes(p.format))
  if (bad) throw new Error(`${bad.format} no existe en ${ctx.platform}. Usa solo: ${FORMATS[ctx.platform].join(', ')}.`)
  uniqueTexts(o.posts.map(p => p.hook), 'Ganchos')
  uniqueTexts([...new Set(ctx.prevTopics), ...o.posts.map(p => p.topic)], 'Temas (incluidos los de semanas anteriores)')
  checkGrounded(o.posts.map(p => p.caption), ctx.facts)
}

// 7 días: la publicación de cada día que publica, null = descanso.
export function weekDays(posts: Post[], days: number) {
  const out: (Post | null)[] = Array(7).fill(null)
  spreadDays(days).forEach((d, i) => { out[d] = posts[i] ?? null })
  return out
}
