import { test } from 'node:test'
import assert from 'node:assert/strict'
import { afterFail, pinLocked, tempPin } from './av-pin'

const now = new Date('2026-10-19T12:00:00Z')

test('pin: 4 fallos no bloquean, el 5.º bloquea 15 minutos', () => {
  assert.deepEqual(afterFail(3, now), { pin_fails: 4, locked_until: null })
  const r = afterFail(4, now)
  assert.equal(r.pin_fails, 5)
  assert.equal(r.locked_until!.getTime(), now.getTime() + 15 * 60_000)
})
test('pin: 20 fallos acumulados bloquean hasta que el admin lo resetee', () => {
  assert.equal(afterFail(19, now).locked_until!.getUTCFullYear(), 9999)
})
test('pin: el bloqueo respeta la hora', () => {
  const row = afterFail(4, now)
  assert.equal(pinLocked(row, now), true)
  assert.equal(pinLocked(row, new Date(now.getTime() + 16 * 60_000)), false)
  assert.equal(pinLocked({ pin_fails: 0, locked_until: null }, now), false)
})
test('pin: el temporal son 4 dígitos', () => {
  for (let i = 0; i < 100; i++) assert.match(tempPin(), /^\d{4}$/)
})
test('pin: los triviales no se aceptan al crearlo', async () => {
  const { weakPin } = await import('./av-pin')
  for (const p of ['0000', '1111', '9999', '1234', '4321', '0123', '9876', '1990', '2015', '2026', '1212'])
    assert.equal(weakPin(p), true, p)
  for (const p of ['4826', '7351', '2468', '5094']) assert.equal(weakPin(p), false, p)
})
