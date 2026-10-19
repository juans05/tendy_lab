// Solo con TEST_DB=1 contra la BD local. Nunca contra la BD real del .env.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'

const ON = process.env.TEST_DB === '1' && /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? '')
const opts = { skip: !ON && 'requiere TEST_DB=1 y BD local' }
process.env.MEDIA_ENC_KEY ??= randomBytes(32).toString('base64')
const S = { uploads_enabled: true, max_photo_mb: 8, max_photos_per_kit: 3, retention_days: 365, consent_version: 'v-test', kits_url: '' }
const advId = async () => String((await (await import('./db')).q(`select id from adventures where slug='fantasmin'`))[0].id)

test('QR: genera un lote de N códigos únicos con el formato correcto', opts, async () => {
  const { generateBatch } = await import('./av-admin')
  const { CODE_RE } = await import('./av-codes')
  const codes = await generateBatch(await advId(), `lote-${Date.now()}`, 25)
  assert.equal(new Set(codes).size, 25)
  for (const c of codes) assert.match(c, CODE_RE)
  await assert.rejects(generateBatch(await advId(), 'x', 0))
  await assert.rejects(generateBatch(await advId(), 'x', 1001))
})

test('QR: reasignar un lote cambia la aventura de todos sus códigos', opts, async () => {
  const { generateBatch, reassign } = await import('./av-admin')
  const { q } = await import('./db')
  const [c] = await q(`select id from collections where slug='halloween'`)
  const [other] = await q(`insert into adventures(slug,collection_id,title,description) values($1,$2,'Otra','D') returning id`, [`otra-${Date.now()}`, c.id])
  const batch = `lote-r-${Date.now()}`
  await generateBatch(await advId(), batch, 3)
  assert.equal(await reassign({ batch }, String(other.id)), 3)
  assert.equal((await q(`select count(*)::int n from qr_codes where batch=$1 and adventure_id=$2`, [batch, other.id]))[0].n, 3)
})

test('PIN: el reseteo da un PIN temporal que funciona y desbloquea el kit', opts, async () => {
  const { generateBatch, resetPin } = await import('./av-admin')
  const { setPin, verifyPin } = await import('./av-album')
  const { q } = await import('./db')
  const [code] = await generateBatch(await advId(), `lote-p-${Date.now()}`, 1)
  const [k] = await q(`select id from qr_codes where code=$1`, [code])
  await setPin(String(k.id), '1234')
  for (let i = 0; i < 20; i++) await verifyPin(code, '0000') // bloqueado hasta reset
  const temp = await resetPin(code)
  assert.match(temp!, /^\d{4}$/)
  assert.equal((await verifyPin(code, temp!)).status, 'ok')
  assert.equal(await resetPin('TP-22222222'), null)
})

test('moderación: solo se aprueba con permiso de galería vigente', opts, async () => {
  const { generateBatch, moderate } = await import('./av-admin')
  const { savePhotos, revokeConsent } = await import('./av-album')
  const { q } = await import('./db')
  const [code] = await generateBatch(await advId(), `lote-m-${Date.now()}`, 1)
  const [k] = await q(`select id from qr_codes where code=$1`, [code])
  const [withG, without] = [(await savePhotos(String(k.id), [Buffer.from('a')], ['store', 'gallery'], S))[0], (await savePhotos(String(k.id), [Buffer.from('b')], ['store'], S))[0]]
  assert.equal(await moderate(withG, 'approved'), true)
  assert.equal(await moderate(without, 'approved'), false)
  assert.equal(await moderate(without, 'rejected'), true)
  await revokeConsent(String(k.id), withG, 'gallery')
  assert.equal(await moderate(withG, 'approved'), false)
})

test('QR: apunta a /k/<código> del dominio configurado y sale en PNG 1024 y SVG', async () => {
  const { kitUrl, adventureUrl, qrPng, qrSvg } = await import('./av-admin')
  const sharp = (await import('sharp')).default
  process.env.PUBLIC_BASE_URL = 'https://tendyperu.com'
  assert.equal(kitUrl('TP-7KQ9M2XA'), 'https://tendyperu.com/k/TP-7KQ9M2XA')
  assert.equal(adventureUrl('fantasmin'), 'https://tendyperu.com/aventuras/fantasmin')
  const m = await sharp(await qrPng(kitUrl('TP-7KQ9M2XA'))).metadata()
  assert.equal(m.format, 'png'); assert.equal(m.width, 1024)
  assert.match(await qrSvg(kitUrl('TP-7KQ9M2XA')), /^<svg/)
})
