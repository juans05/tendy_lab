import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { decrypt, encrypt, mediaKey } from './av-crypto'

const key = randomBytes(32)
const photo = Buffer.from('RIFF....WEBPfoto de prueba')

test('cifrado: ida y vuelta devuelve la foto y lo guardado no es legible', () => {
  const e = encrypt(photo, key)
  assert.ok(!e.data.includes(Buffer.from('WEBP')))
  assert.deepEqual(decrypt(e, key), photo)
})
test('cifrado: alterar datos o tag, o usar otra clave, falla', () => {
  const e = encrypt(photo, key)
  const bad = Buffer.from(e.data); bad[0] ^= 1
  assert.throws(() => decrypt({ ...e, data: bad }, key))
  const tag = Buffer.from(e.tag); tag[0] ^= 1
  assert.throws(() => decrypt({ ...e, tag }, key))
  assert.throws(() => decrypt(e, randomBytes(32)))
})
test('cifrado: IV distinto en cada cifrado', () => {
  assert.notDeepEqual(encrypt(photo, key).iv, encrypt(photo, key).iv)
})
test('cifrado: MEDIA_ENC_KEY ausente o corta no da clave', () => {
  const old = process.env.MEDIA_ENC_KEY
  process.env.MEDIA_ENC_KEY = 'corta'; assert.equal(mediaKey(), null)
  delete process.env.MEDIA_ENC_KEY; assert.equal(mediaKey(), null)
  process.env.MEDIA_ENC_KEY = key.toString('base64'); assert.deepEqual(mediaKey(), key)
  if (old === undefined) delete process.env.MEDIA_ENC_KEY; else process.env.MEDIA_ENC_KEY = old
})
