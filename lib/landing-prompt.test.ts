import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLandingPrompt, hexesIn, readableOn } from './landing-prompt'

test('prompt de landing: vacío → PENDIENTE, datos y ambiente/tono insertados', () => {
  const p = buildLandingPrompt({ producto: 'Lámpara Luna', precio: '  ' }, 'elegante', 'cercano')
  assert.match(p, /- Nombre del producto: Lámpara Luna\n/)
  assert.match(p, /- Precio y promociones: PENDIENTE\n/)
  assert.match(p, /- Ambiente: elegante\n/)
  assert.match(p, /- Tono: cercano\./)
  assert.equal(p.match(/: PENDIENTE/g)?.length, 16)
  assert.match(buildLandingPrompt({}, 'elegante', 'cercano', { primary: '#FE6900', accent: '#17324D' }), /principal #FE6900, acento #17324D/)
  assert.match(buildLandingPrompt({}, 'elegante', 'cercano', undefined, 'https://ref.example'), /Usa https:\/\/ref\.example SOLO como referencia de diseño/)
  assert.match(p, /formulario decorativo/)
  assert.match(p, /REVISIÓN FINAL/)
})

test('readableOn: texto oscuro sobre claro, blanco sobre oscuro', () => {
  assert.equal(readableOn('#ffc857'), '#202020')
  assert.equal(readableOn('#17324d'), '#ffffff')
  assert.deepEqual(hexesIn('Azul #18334D y crema #FFFAF4'), ['#18334D', '#FFFAF4'])
})
