import test from 'node:test'
import assert from 'node:assert/strict'
import { profit, suggestedPrice } from './profit'
import { score, VIDEO_DIMS } from './scoring'

const base = { price: 10000, product_cost: 4000, ads_cost: 2000, packaging: 300, delivery: 500, other: 0, fee_pct: 3.5, tax_pct: 0, target_margin_pct: 20 }

test('precio sugerido: costo más ganancia y gastos', () => {
  assert.equal(suggestedPrice(2000, 1500, 0, 0), 3500)
  const cost = 6800, gain = 2000
  const price = suggestedPrice(cost, gain, 3.5, 2)
  const result = profit({ ...base, price, fee_pct: 3.5, tax_pct: 2 })
  assert.ok(result.net_profit >= gain)
  assert.throws(() => suggestedPrice(cost, gain, 50, 50))
})
test('precio sugerido: redondeo separado no reduce la ganancia', () => {
  for (let cost = 1; cost < 300; cost++) {
    const price = suggestedPrice(cost, 13, 3.5, 18)
    assert.ok(price - Math.round(price * .035) - Math.round(price * .18) - cost >= 13)
  }
})

test('profit: números conocidos', () => {
  const r = profit(base) // fee = 350
  assert.equal(r.total_cost, 4000 + 2000 + 300 + 500 + 350)
  assert.equal(r.net_profit, 10000 - 7150)
  assert.equal(r.max_cac_breakeven, 10000 - 5150) // contribución = 4850
  assert.equal(r.breakeven_roas, Math.round((10000 / 4850) * 100) / 100) // 2.06, no revenue/ads
  assert.equal(r.max_cac_target, 4850 - 2000)
  assert.equal(r.profit_100, r.net_profit * 100)
})
test('profit: sin equilibrio devuelve null, no 0', () => {
  const r = profit({ ...base, product_cost: 10000 })
  assert.equal(r.breakeven_roas, null)
  assert.equal(r.max_cac_target, null)
})
test('profit: escenarios cambian solo la publicidad', () => {
  const [c, b, a] = profit(base).scenarios
  assert.equal(b.net_profit, profit(base).net_profit)
  assert.ok(c.net_profit < b.net_profit && a.net_profit > b.net_profit)
})
test('score: pesos, clamp y banda', () => {
  const dims = VIDEO_DIMS.map(name => ({ name, score: 200 })) // se recorta a 100
  const s = score('video', dims)
  assert.equal(s.overall, 100)
  assert.equal(s.band, 'Alto')
  assert.equal(score('video', VIDEO_DIMS.map(name => ({ name, score: 40 }))).band, 'Bajo')
  assert.throws(() => score('video', dims.slice(1))) // falta una dimensión
})
