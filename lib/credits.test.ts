import { test } from 'node:test'
import assert from 'node:assert/strict'
import { coins } from './credits'
test('monedas: singular, plural y decimales', () => {
  assert.equal(coins(10), '1 moneda')
  assert.equal(coins(30), '3 monedas')
  assert.equal(coins(5), '0.5 monedas')
  assert.equal(coins(100), '10 monedas')
})
