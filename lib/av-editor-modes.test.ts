import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyEndMode, endMode } from './av-editor-modes'
import type { Scene } from './av-story'

const s = (id: string, extra: Partial<Scene> = {}): Scene => ({ id, title: id, video: 'v', ending: false, choices: [], ...extra })
const all = [s('a'), s('b'), s('c')]

test('editor: el modo se deduce del capítulo', () => {
  assert.equal(endMode(s('a')), 'next')
  assert.equal(endMode(s('a', { ending: true })), 'end')
  assert.equal(endMode(s('a', { next: 'c' })), 'jump')
  assert.equal(endMode(s('a', { choices: [{ label: 'x', next: 'b' }, { label: 'y', next: 'c' }] })), 'choose')
})

test('editor: cambiar de modo deja el capítulo coherente', () => {
  const choose = applyEndMode(s('a', { ending: true }), 'choose', all)
  assert.deepEqual(choose.choices.map(c => c.next), ['b', 'c'])
  assert.equal(choose.ending, false)
  assert.equal(choose.next, null)
  const jump = applyEndMode(choose, 'jump', all)
  assert.deepEqual([jump.choices, jump.next, jump.ending], [[], 'b', false])
  const end = applyEndMode(jump, 'end', all)
  assert.deepEqual([end.choices, end.next, end.ending], [[], null, true])
  const next = applyEndMode(end, 'next', all)
  assert.deepEqual([next.choices, next.next, next.ending], [[], null, false])
})

test('editor: elegir con un solo capítulo más crea solo las opciones posibles', () => {
  const r = applyEndMode(s('a'), 'choose', [s('a'), s('b')])
  assert.deepEqual(r.choices.map(c => c.next), ['b', 'b'])
})
