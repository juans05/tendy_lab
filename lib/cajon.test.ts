import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cajon } from './cajon'
test('cajón: ventas para pagarlo, redondeo hacia arriba', () => {
  assert.deepEqual(cajon({ boxCost: 600, units: 40, price: 45, perSale: 6 }), { valid: true, unitCost: 15, profitPerSale: 24, salesNeeded: 25, profitIfAllSold: 960 })
  assert.equal(cajon({ boxCost: 600, units: 40, price: 45 }).salesNeeded, 20) // 600/30
  assert.equal(cajon({ boxCost: 100, units: 10, price: 13 }).salesNeeded, 34) // 100/3 = 33.3 → 34
})
test('cajón: sin ganancia o datos inválidos no inventa números', () => {
  assert.equal(cajon({ boxCost: 600, units: 40, price: 15 }).salesNeeded, null)
  assert.equal(cajon({ boxCost: 600, units: 40, price: 10 }).profitIfAllSold, null)
  for (const bad of [{ boxCost: 600, units: 0, price: 45 }, { boxCost: 0, units: 10, price: 45 }, { boxCost: -5, units: 10, price: 45 }, { boxCost: 600, units: 40, price: NaN }]) {
    const r = cajon(bad)
    assert.equal(r.salesNeeded, null)
    assert.ok(Number.isFinite(r.unitCost) && Number.isFinite(r.profitPerSale))
  }
})
test('cajón: datos incompletos se distinguen de "no recuperas"', () => {
  assert.equal(cajon({ boxCost: 600, units: 0, price: 45 }).valid, false)
  assert.equal(cajon({ boxCost: 600, units: 40, price: NaN }).valid, false)
  assert.equal(cajon({ boxCost: 600, units: 40, price: 10 }).valid, true) // válido pero no recupera
})
