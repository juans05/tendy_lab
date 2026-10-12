import { z } from 'zod'

const text = z.string().trim().min(12).max(1500)
export const SITUATIONS = ['Saludo', 'Precio', 'Envío y entrega', 'Formas de pago', 'Está caro', 'Confianza y garantía', 'Disponibilidad', 'Cierre de venta', 'Seguimiento 24 h'] as const
export const WhatsappOut = z.object({ replies: z.array(z.object({ situation: z.enum(SITUATIONS), customer: z.string().trim().min(3).max(300), reply: text })).min(8).max(10) })
export const CopyOut = z.object({
  captions: z.array(z.object({ kind: z.enum(['Corta', 'Media', 'Historia']), text, cta: z.string().trim().min(5).max(300) })).length(3),
  hashtags: z.array(z.string().regex(/^#[\p{L}\p{N}_]+$/u)).min(10).max(15),
  first_comment: z.string().trim().min(5).max(500),
})

export const PromptOut = z.object({
  prompt: z.string().trim().min(80).max(4000),
  improvements: z.array(z.string().trim().min(5).max(300)).min(2).max(6),
  how_to: z.array(z.string().trim().min(5).max(300)).min(2).max(5),
  missing: z.array(z.string().trim().min(3).max(200)).max(5),
})
export const LandingOut = z.object({
  product_name: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(8).max(90),
  subheadline: z.string().trim().min(12).max(220),
  benefits: z.array(z.object({ title: z.string().trim().min(3).max(60), text: z.string().trim().min(10).max(260) })).min(3).max(5),
  faqs: z.array(z.object({ q: z.string().trim().min(5).max(140), a: z.string().trim().min(5).max(400) })).min(3).max(5),
  cta: z.string().trim().min(3).max(40),
})

// Precios, descuentos y plazos solo pueden salir de lo que escribió el usuario (45 = 45.00 = 45,0).
const nums = (s: string) => (s.replace(/#[\p{L}\p{N}_]+/gu, '').match(/\d+(?:[.,]\d+)?/g) ?? []).map(n => String(Number(n.replace(',', '.'))))
export function checkGrounded(texts: string[], input: string) {
  const allowed = new Set(nums(input))
  const invented = [...new Set(texts.flatMap(nums))].filter(n => !allowed.has(n))
  if (invented.length) throw new Error(`Usaste cifras que el usuario no dio (${invented.join(', ')}). Quítalas o usa [completa: dato].`)
}
