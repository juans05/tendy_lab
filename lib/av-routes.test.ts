import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'

// Defensas de las rutas públicas que actúan antes de tocar la BD.
process.env.MEDIA_ENC_KEY ??= randomBytes(32).toString('base64')

test('subida: un cuerpo enorme se rechaza antes de leerlo', async () => {
  const { POST } = await import('../app/api/aventuras/fotos/route')
  const r = await POST(new Request('http://x/api/aventuras/fotos', { method: 'POST', headers: { 'content-length': String(500 * 1024 * 1024), 'x-forwarded-for': '9.9.9.1' }, body: 'x' }))
  assert.equal(r.status, 413)
})

test('mis fotos: demasiados intentos de PIN desde una IP se frenan', async () => {
  const { POST } = await import('../app/api/aventuras/album/route')
  const req = () => new Request('http://x/api/aventuras/album', { method: 'POST', headers: { 'x-forwarded-for': '9.9.9.2' }, body: 'no-json' })
  const codes: number[] = []
  for (let i = 0; i < 31; i++) codes.push((await POST(req())).status)
  assert.equal(codes[0], 400)
  assert.equal(codes.at(-1), 429)
})
