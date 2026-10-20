import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { cardBox, composeCard, DEFAULT_QR } from './av-card'

test('tarjeta: la posición en % se convierte a píxeles dentro de la imagen', () => {
  assert.deepEqual(cardBox(1128, 1600, DEFAULT_QR), { left: 864, top: 1336, size: 219 })
  // nunca se sale de la imagen aunque el admin se pase
  const b = cardBox(1000, 1000, { x: 95, y: 95, size: 30 })
  assert.ok(b.left + b.size <= 1000 && b.top + b.size <= 1000)
})

test('tarjeta: el QR se pega sobre la plantilla en el recuadro', async () => {
  const template = await sharp({ create: { width: 1128, height: 1600, channels: 3, background: '#461577' } }).png().toBuffer()
  const out = await composeCard(template, 'https://tendyperu.com/k/TP-7KQ9M2XA', DEFAULT_QR)
  const m = await sharp(out).metadata()
  assert.deepEqual([m.format, m.width, m.height], ['png', 1128, 1600])
  const px = async (x: number, y: number) => [...(await sharp(out).extract({ left: x, top: y, width: 1, height: 1 }).removeAlpha().raw().toBuffer())]
  assert.deepEqual(await px(10, 10), [70, 21, 119]) // fuera del recuadro sigue la plantilla
  assert.deepEqual(await px(866, 1338), [255, 255, 255]) // borde blanco del QR dentro del recuadro
})
