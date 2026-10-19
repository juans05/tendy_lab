import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CODE_RE, newCode, normalizeCode } from './av-codes'

test('códigos: formato TP-XXXXXXXX y sin repetidos en 10k', () => {
  const s = new Set(Array.from({ length: 10000 }, newCode))
  assert.equal(s.size, 10000)
  for (const c of s) assert.match(c, CODE_RE)
})
test('códigos: normaliza minúsculas, espacios y falta de guion', () => {
  assert.equal(normalizeCode(' tp-7kq9m2xa '), 'TP-7KQ9M2XA')
  assert.equal(normalizeCode('TP7KQ9M2XA'), 'TP-7KQ9M2XA')
  assert.equal(normalizeCode('tp 7kq9 m2xa'), 'TP-7KQ9M2XA')
  assert.equal(normalizeCode('TP-7KQ9M2X0'), null) // 0 no existe en el alfabeto
  assert.equal(normalizeCode('x'), null)
})
