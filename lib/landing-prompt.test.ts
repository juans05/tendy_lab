import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLandingPrompt } from './landing-prompt'

test('prompt de landing: vacío → PENDIENTE, datos y ambiente/tono insertados', () => {
  const p = buildLandingPrompt({ producto: 'Lámpara Luna', precio: '  ' }, 'elegante', 'cercano')
  assert.match(p, /- Nombre del producto: Lámpara Luna\n/)
  assert.match(p, /- Precio y promociones: PENDIENTE\n/)
  assert.match(p, /- Ambiente: elegante\n/)
  assert.match(p, /- Tono: cercano\./)
  assert.equal(p.match(/: PENDIENTE/g)?.length, 16)
})
