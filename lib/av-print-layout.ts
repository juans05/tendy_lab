// Tamaño de las tarjetas en la hoja: margen alrededor y separación entre tarjetas para cortar sin tocar el diseño.
// Mantiene la proporción de la plantilla (1128×1600) y usa el mayor tamaño que entra. Medidas en mm.
const RATIO = 1128 / 1600

export function fitCards(page: { w: number; h: number }, cols: number, rows: number, margin = 10, gap = 8) {
  const maxW = (page.w - 2 * margin - (cols - 1) * gap) / cols
  const maxH = (page.h - 2 * margin - (rows - 1) * gap) / rows
  const cardW = Math.min(maxW, maxH * RATIO)
  return { cardW, cardH: cardW / RATIO, margin, gap }
}
