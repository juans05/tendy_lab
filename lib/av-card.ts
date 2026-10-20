import QRCode from 'qrcode'
import sharp from 'sharp'

// Tarjeta para imprimir: la plantilla de la aventura con el QR del kit dentro de su recuadro.
// La posición va en %: x e y respecto a ancho/alto, size respecto al ancho. Por defecto, el recuadro blanco
// de la plantilla de Halloween (243 px en 852,1324 de 1128×1600) con un margen interior.
export type QrSpot = { x: number; y: number; size: number }
export const DEFAULT_QR: QrSpot = { x: 76.6, y: 83.5, size: 19.4 }

export function cardBox(w: number, h: number, q: QrSpot) {
  const left = Math.round(w * q.x / 100), top = Math.round(h * q.y / 100)
  return { left, top, size: Math.max(1, Math.min(Math.round(w * q.size / 100), w - left, h - top)) }
}

export async function composeCard(template: Buffer, url: string, q: QrSpot): Promise<Buffer> {
  const img = sharp(template, { limitInputPixels: 40_000_000 }).rotate()
  const { width = 0, height = 0 } = await img.metadata()
  const b = cardBox(width, height, q)
  const qr = await QRCode.toBuffer(url, { width: b.size, margin: 1, errorCorrectionLevel: 'M' })
  // qrcode redondea al tamaño de módulo: se ajusta al recuadro exacto.
  const fit = await sharp(qr).resize(b.size, b.size, { kernel: 'nearest' }).toBuffer()
  return img.composite([{ input: fit, left: b.left, top: b.top }]).png().toBuffer()
}
