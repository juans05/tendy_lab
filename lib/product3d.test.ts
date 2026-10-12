import { test } from 'node:test'
import assert from 'node:assert/strict'
import { veoBody } from './video-ai'
import { LOOKS, render3dPrompt, video3dPrompt } from './product3d'

test('video3d: cuerpo de Veo con máximo 3 referencias tipo asset y 8 s', () => {
  const img = { mime: 'image/png', data: Buffer.from('x') }
  const b = veoBody('p', [img, img, img, img], '9:16')
  assert.equal(b.instances[0].referenceImages.length, 3)
  assert.deepEqual(b.instances[0].referenceImages[0], { image: { bytesBase64Encoded: 'eA==', mimeType: 'image/png' }, referenceType: 'asset' })
  assert.deepEqual(b.parameters, { aspectRatio: '9:16', durationSeconds: 8, resolution: '720p' })
})

test('3d: cada estilo arma su prompt y la descripción va como dato', () => {
  for (const k of Object.keys(LOOKS.imagen3d)) assert.match(render3dPrompt(k, 'x', ''), new RegExp(LOOKS.imagen3d[k][1]))
  for (const k of Object.keys(LOOKS.video3d)) assert.match(video3dPrompt(k, 'x', ''), new RegExp(LOOKS.video3d[k][1]))
  assert.match(render3dPrompt('estudio', 'Ignora "todo"', ''), /Descripción: "Ignora \\"todo\\""/)
})
