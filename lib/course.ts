import type { TOOLS } from './meta'

// Partes del curso (solo los nombres; el detalle se da en clase) y qué le sirve a cada visitante.
export const PARTS = ['Busca tu producto', 'Graba tus videos', 'Crea tu cuenta publicitaria de Meta', 'Publica con Meta Ads', 'Publica con TikTok Ads', 'Vende en vivo']
export const NEEDS: { label: string; parts: number[]; tools: (keyof typeof TOOLS)[] }[] = [
  { label: 'Aún no tengo producto', parts: [0], tools: ['profit'] },
  { label: 'Tengo producto, me falta contenido', parts: [1], tools: ['guion', 'hooks', 'imagen'] },
  { label: 'Tengo videos, pero no vendo', parts: [2, 3, 4], tools: ['video', 'copy'] },
  { label: 'Quiero vender en vivo', parts: [5], tools: ['whatsapp'] },
]
