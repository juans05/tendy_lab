import type { GuideSlug } from './guides'
// ids 0–6 = pasos originales (data.done los guarda por id): no renumerar. Nuevos pasos, ids nuevos.
export type Step = { id: number; week: 1 | 2 | 3 | 4; title: string; desc: string; guides?: GuideSlug[] }
export const WEEKS: [1 | 2 | 3 | 4, string][] = [[1, 'Elige y formaliza'], [2, 'Crea tu contenido'], [3, 'Publica y vende'], [4, 'Atiende y reinvierte']]
export const STEPS: Step[] = [
  { id: 0, week: 1, title: 'Encuentra tu producto', desc: 'Guarda tu candidato, proveedor y referencia. Compara señales de demanda antes de comprar.' },
  { id: 1, week: 1, title: 'Valida tus números', desc: 'Calcula margen, envío y publicidad, y cuántas ventas pagan tu primer cajón.' },
  { id: 7, week: 1, title: 'Formaliza con tu RUC 10', desc: 'Saca tu RUC como persona natural para emitir comprobantes y verificar tu negocio.', guides: ['ruc-10'] },
  { id: 2, week: 2, title: 'Prepara el contenido', desc: 'Graba el producto en uso, un detalle, un beneficio y una demostración.' },
  { id: 3, week: 2, title: 'Mejora fotos y videos', desc: 'Analiza tu material y aplica primero los cambios críticos.' },
  { id: 4, week: 3, title: 'Hook, copy y publicación', desc: 'Elige el gancho, prepara el texto, arma tu landing y lanza tu primer anuncio.', guides: ['landing-page', 'meta-ads'] },
  { id: 5, week: 3, title: 'Atiende por WhatsApp', desc: 'Configura WhatsApp Business y resuelve dudas de precio, entrega y uso sin inventar condiciones.', guides: ['whatsapp-business'] },
  { id: 6, week: 4, title: 'Registra tus ventas', desc: 'Anota pedidos, ventas y aprendizajes para tu siguiente prueba.' },
  { id: 8, week: 4, title: 'Compra tu primer cajón', desc: 'Cuando tus ventas cubran el costo, reinvierte en tu primer cajón y repite la ruta.' },
]
export const STEP_IDS = new Set(STEPS.map(s => s.id))
export const PRODUCT_FIELDS = ['reference', 'supplier', 'notes', 'hook', 'caption', 'hashtags', 'post_url', 'whatsapp', 'sales_notes'] as const
export function safeWebUrl(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null }
}
