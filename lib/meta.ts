import { COST } from './credits'

export const TOOLS = {
  imagen: { title: 'Crea una imagen', desc: 'Convierte tu idea en una imagen con un prompt de siete líneas y el contexto de Mi marca.' },
  transcribir: { title: 'Video a texto', desc: 'Transcribe un video con tiempos y recibe una versión parafraseada para Mi marca. 10 monedas por el proceso completo.' },
  guion: { title: 'Guion para grabar', desc: 'Sube una foto y cuenta qué vendes. Recibe qué decir y qué grabar para un video de 15, 30 o 60 segundos.' },
  foto: { title: 'Foto lista para vender', desc: 'Cambia o quita el fondo de tu foto, o agrégale lo que pidas, con tu producto como protagonista.' },
  imagen3d: { title: 'Tu producto en 3D', desc: 'Sube de 2 a 3 fotos desde distintos ángulos y recibe una imagen 3D o un video de 8 segundos girando.' },
  video3d: { title: 'Video 3D de tu producto', desc: 'Un video de 8 segundos de tu producto girando, a partir de 2 a 3 fotos desde distintos ángulos.' },
  video: { title: 'Analiza mi Video', desc: 'MP4/MOV/WebM de hasta 90 s. Score por dimensiones, momentos clave, fallas y mejoras.' },
  hooks: { title: 'Hooks desde Producto', desc: 'De 1 a 5 fotos del producto. 12+ hooks agrupados por ángulo.' },
  creativo: { title: 'Analiza mi Creativo', desc: 'Una imagen JPG/PNG/WEBP. Jerarquía, legibilidad, oferta, CTA y cambios priorizados.' },
  whatsapp: { title: 'Respuestas para WhatsApp', desc: 'Respuestas listas para copiar: precio, envío, pagos, objeciones y seguimiento, con el tono de Mi marca.' },
  copy: { title: 'Copy para publicar', desc: 'Tres versiones de caption con CTA, hashtags y primer comentario para tu publicación.' },
  prompt: { title: 'Mejorar mi prompt', desc: 'Escribe tu idea o pega tu prompt. Te lo devolvemos detallado, con tu marca, listo para ChatGPT, Gemini, Meta AI o Lovable.' },
  landing: { title: 'Página de producto', desc: 'Sube fotos y datos de tu producto. Creamos una página de venta publicada, con botón de WhatsApp y formulario de pedido.' },
  profit: { title: '¿A cuánto lo vendo?', desc: 'Suma tus gastos, elige cuánto quieres ganar y calcula tu precio de venta.' },
} as const

// Agrupación por objetivo (panel y landing). foto vive como pestaña de imagen y video3d de imagen3d; cada herramienta en un solo grupo.
export const TOOL_GROUPS: [string, string, (keyof typeof TOOLS)[]][] = [
  ['Crear contenido', 'Imágenes, guiones y textos con tu marca', ['imagen', 'imagen3d', 'guion', 'hooks', 'copy', 'prompt']],
  ['Analizar', 'Mejora lo que ya tienes antes de publicar', ['video', 'creativo', 'transcribir']],
  ['Vender', 'Precio y atención para cerrar la venta', ['landing', 'profit', 'whatsapp']],
]
// Mejorar mi prompt: destino → [nombre, dónde pegarlo, herramienta de Tendy que lo hace por ti]
export const PROMPT_TARGETS: Record<string, [string, string, string, string]> = {
  imagen: ['Crear una imagen', 'ChatGPT, Gemini o Meta AI', '/panel/tools/imagen', 'Crea una imagen'],
  foto: ['Mejorar una foto que ya tengo', 'ChatGPT o Gemini, subiendo tu foto junto al prompt', '/panel/tools/imagen?modo=fondo', 'Editar mi foto'],
  landing: ['Una landing page', 'Lovable, v0, Bolt o ChatGPT', '/panel/tools/landing', 'Página de producto'],
  meta: ['Un anuncio para Meta (Facebook e Instagram)', 'ChatGPT o Meta AI, y luego el Administrador de anuncios', '/panel/tools/copy', 'Copy para publicar'],
  video: ['Un video con IA', 'Veo (Gemini), Sora, Kling o Runway', '/panel/tools/imagen3d?modo=video', 'Video 3D de tu producto'],
}
export const OBJECTIVES = ['ventas', 'seguidores', 'mensajes', 'reconocimiento', 'lanzamiento']
export const PLATFORMS = ['TikTok', 'Instagram', 'Meta Ads', 'Multicanal']
export const toolCost = (t: keyof typeof COST) => COST[t]
const SYM: Record<string, string> = { PEN: 'S/', USD: '$', EUR: '€', MXN: '$', COP: '$', CLP: '$', ARS: '$' }
export const money = (cents: number | null, cur = 'PEN') =>
  cents == null ? '—' : `${SYM[cur] ?? cur} ${(cents / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
