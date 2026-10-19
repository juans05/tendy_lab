import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { crc32 } from 'node:zlib'
import { sanitizeImage } from './av-image'

const MB = 1024 * 1024
const solid = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: '#fe6900' } })

test('imagen: JPEG con EXIF sale como WebP sin metadatos', async () => {
  const jpg = await solid(200, 100).jpeg().withExif({ IFD0: { Copyright: 'casa de Sofi' } }).toBuffer()
  assert.ok((await sharp(jpg).metadata()).exif) // la entrada sí trae EXIF
  const out = await sanitizeImage(jpg, 8 * MB)
  const m = await sharp(out).metadata()
  assert.equal(m.format, 'webp')
  assert.equal(m.exif, undefined)
})
test('imagen: PNG grande se reduce a 2000 px en su lado mayor', async () => {
  const out = await sanitizeImage(await solid(3000, 1000).png().toBuffer(), 8 * MB)
  assert.equal((await sharp(out).metadata()).width, 2000)
})
test('imagen: HTML renombrado o GIF real se rechazan', async () => {
  await assert.rejects(sanitizeImage(Buffer.from('<html><script>x</script></html>'), 8 * MB), /formato/)
  await assert.rejects(sanitizeImage(await solid(10, 10).gif().toBuffer(), 8 * MB), /formato/)
})
test('imagen: vacía o mayor al tope se rechaza por tamaño', async () => {
  await assert.rejects(sanitizeImage(Buffer.alloc(0), 8 * MB), /tamaño/)
  await assert.rejects(sanitizeImage(await solid(100, 100).png().toBuffer(), 10), /tamaño/)
})
test('imagen: cabecera que declara 20000×20000 se rechaza sin colgarse', async () => {
  // PNG pequeño con la cabecera IHDR reescrita (CRC válido): la "bomba" típica de descompresión.
  const png = Buffer.from(await solid(10, 10).png().toBuffer())
  png.writeUInt32BE(20000, 16); png.writeUInt32BE(20000, 20)
  png.writeUInt32BE(crc32(png.subarray(12, 29)), 29)
  await assert.rejects(sanitizeImage(png, 8 * MB))
})
