import { test } from 'node:test'
import assert from 'node:assert/strict'
import { imageUrl, signParams, uploadSignature, videoUrl } from './av-cloudinary'

test('cloudinary: firma igual al ejemplo de la documentación', () => {
  assert.equal(signParams({ timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' }, 'abcd'),
    'bfd09f95f331f558cbd1320e67aa8d488770583e')
})
test('cloudinary: URLs optimizadas para celular', () => {
  process.env.CLOUDINARY_CLOUD_NAME = 'demo'
  assert.equal(videoUrl('tendy-aventuras/fantasmin/cap1'), 'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto,w_720/tendy-aventuras/fantasmin/cap1')
  assert.equal(imageUrl('a/b', 400), 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto,w_400/a/b')
})
test('cloudinary: firma de subida incluye carpeta y no expone el secreto', () => {
  Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'demo', CLOUDINARY_API_KEY: 'k1', CLOUDINARY_API_SECRET: 'sec' })
  const s = uploadSignature('tendy-aventuras/fantasmin')
  assert.equal(s.folder, 'tendy-aventuras/fantasmin')
  assert.equal(s.signature, signParams({ folder: s.folder, timestamp: s.timestamp }, 'sec'))
  assert.ok(!JSON.stringify(s).includes('sec"'))
})
