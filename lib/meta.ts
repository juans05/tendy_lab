import { COST } from './credits'

export const TOOLS = {
  imagen: { title: 'Crea una imagen', desc: 'Convierte tu idea en una imagen con un prompt de siete líneas y el contexto de Mi marca.' },
  transcribir: { title: 'Video a texto', desc: 'Transcribe un video con tiempos y recibe una versión parafraseada para Mi marca. 10 monedas por el proceso completo.' },
  guion: { title: 'Guion para grabar', desc: 'Sube una foto y cuenta qué vendes. Recibe qué decir y qué grabar para un video de 15, 30 o 60 segundos.' },
  foto: { title: 'Foto lista para vender', desc: 'Transforma el fondo de tu foto para catálogo o anuncio, con tu producto como protagonista.' },
  video: { title: 'Analiza mi Video', desc: 'MP4/MOV/WebM de hasta 90 s. Score por dimensiones, momentos clave, fallas y mejoras.' },
  hooks: { title: 'Hooks desde Producto', desc: 'De 1 a 5 fotos del producto. 12+ hooks agrupados por ángulo.' },
  creativo: { title: 'Analiza mi Creativo', desc: 'Una imagen JPG/PNG/WEBP. Jerarquía, legibilidad, oferta, CTA y cambios priorizados.' },
  whatsapp: { title: 'Respuestas para WhatsApp', desc: 'Respuestas listas para copiar: precio, envío, pagos, objeciones y seguimiento, con el tono de Mi marca.' },
  copy: { title: 'Copy para publicar', desc: 'Tres versiones de caption con CTA, hashtags y primer comentario para tu publicación.' },
  profit: { title: '¿A cuánto lo vendo?', desc: 'Suma tus gastos, elige cuánto quieres ganar y calcula tu precio de venta.' },
} as const

// Agrupación por objetivo (panel y landing). foto vive como pestaña de imagen; cada herramienta en un solo grupo.
export const TOOL_GROUPS: [string, string, (keyof typeof TOOLS)[]][] = [
  ['Crear contenido', 'Imágenes, guiones y textos con tu marca', ['imagen', 'guion', 'hooks', 'copy']],
  ['Analizar', 'Mejora lo que ya tienes antes de publicar', ['video', 'creativo', 'transcribir']],
  ['Vender', 'Precio y atención para cerrar la venta', ['profit', 'whatsapp']],
]
export const OBJECTIVES = ['ventas', 'seguidores', 'mensajes', 'reconocimiento', 'lanzamiento']
export const PLATFORMS = ['TikTok', 'Instagram', 'Meta Ads', 'Multicanal']
export const toolCost = (t: keyof typeof COST) => COST[t]
const SYM: Record<string, string> = { PEN: 'S/', USD: '$', EUR: '€', MXN: '$', COP: '$', CLP: '$', ARS: '$' }
export const money = (cents: number | null, cur = 'PEN') =>
  cents == null ? '—' : `${SYM[cur] ?? cur} ${(cents / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
