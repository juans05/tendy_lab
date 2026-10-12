import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NEEDS, PARTS } from './course'
import { TOOLS } from './meta'
test('curso: cada necesidad apunta a partes y herramientas que existen', () => {
  assert.equal(PARTS.length, 6)
  for (const n of NEEDS) {
    assert.ok(n.parts.length > 0 && n.parts.every(i => Number.isInteger(i) && i >= 0 && i < PARTS.length), n.label)
    assert.ok(n.tools.length > 0 && n.tools.every(t => t in TOOLS), n.label)
  }
  assert.deepEqual([...new Set(NEEDS.flatMap(n => n.parts))].sort(), [0, 1, 2, 3, 4, 5]) // ninguna parte queda fuera
})
