import test from 'node:test'
import assert from 'node:assert/strict'
import { checkHooks, checkDimensions, uniqueTexts } from './ai-quality'
import { ANGLES } from './hook-angles'
test('hooks: exige dos por ángulo, sin repetir frases', () => {
  const hooks = ANGLES.flatMap(angle => [1, 2].map(i => ({ angle, text: `${angle} propuesta ${i}` })))
  assert.doesNotThrow(() => checkHooks(hooks))
  assert.throws(() => checkHooks(hooks.map(h => ({ ...h, angle: 'venta' }))))
  assert.throws(() => checkHooks(hooks.map(h => ({ ...h, text: 'Una misma propuesta' }))))
})
test('evidencia: rechaza dimensiones duplicadas y textos equivalentes', () => {
  assert.doesNotThrow(() => checkDimensions([{ name: 'a' }, { name: 'b' }], ['a', 'b']))
  assert.throws(() => checkDimensions([{ name: 'a' }, { name: 'a' }], ['a', 'b']))
  assert.throws(() => uniqueTexts(['¡Míralo ahora!', 'miralo ahora'], 'Propuestas'))
})
