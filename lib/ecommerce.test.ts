import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STEPS, STEP_IDS } from './ecommerce'
import { GUIDES } from './guides'
test('ruta: ids estables para el avance ya guardado', () => {
  const byId = Object.fromEntries(STEPS.map(s => [s.id, s.title]))
  assert.equal(byId[0], 'Encuentra tu producto')
  assert.equal(byId[4], 'Hook, copy y publicación')
  assert.equal(byId[6], 'Registra tus ventas')
  assert.equal(STEP_IDS.size, STEPS.length)
  assert.deepEqual([...STEP_IDS].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8])
})
test('ruta: semanas en orden y guías existentes', () => {
  assert.deepEqual(STEPS.map(s => s.week), [...STEPS.map(s => s.week)].sort())
  for (const s of STEPS) for (const g of s.guides ?? []) assert.ok(g in GUIDES, g)
  assert.ok(STEPS.some(s => s.guides?.includes('ruc-10') && s.week === 1))
})
