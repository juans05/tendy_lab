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

test('tarjeta: diseño propio de la aventura, si no el de su colección, si no ninguno', async () => {
  const { templateFor } = await import('./av-card')
  process.env.CLOUDINARY_CLOUD_NAME = 'demo'
  assert.deepEqual(templateFor({ print_template: 'tendy/x', collection_slug: 'halloween' }),
    { url: 'https://res.cloudinary.com/demo/image/upload/q_auto:best/tendy/x', source: 'https://res.cloudinary.com/demo/image/upload/tendy/x' })
  const h = templateFor({ print_template: null, collection_slug: 'halloween' })!
  assert.equal(h.url, '/tarjetas/halloween.jpg')
  assert.ok(h.source.split(/[/\\]/).join('/').endsWith('/public/tarjetas/halloween.jpg'), h.source)
  assert.equal(templateFor({ print_template: null, collection_slug: 'navidad-sin-diseno' }), null)
  assert.equal(templateFor({ print_template: null, collection_slug: '../secreto' }), null)
})

test('tarjeta: el diseño de Halloween incluido sale con el QR en su recuadro', async () => {
  const { readFileSync } = await import('node:fs')
  const { templateFor, composeCard, DEFAULT_QR } = await import('./av-card')
  const out = await composeCard(readFileSync(templateFor({ print_template: null, collection_slug: 'halloween' })!.source), 'https://tendyperu.com/k/TP-7KQ9M2XA', DEFAULT_QR)
  assert.deepEqual([(await sharp(out).metadata()).width, (await sharp(out).metadata()).height], [1128, 1600])
})

test('lotes: se intercalan para que cada hoja lleve uno de cada lote', async () => {
  const { interleave } = await import('./av-card')
  assert.deepEqual(interleave([['F1', 'F2', 'F3'], ['B1', 'B2']]), ['F1', 'B1', 'F2', 'B2', 'F3'])
  assert.deepEqual(interleave([['A1', 'A2']]), ['A1', 'A2'])
  assert.deepEqual(interleave([]), [])
})
