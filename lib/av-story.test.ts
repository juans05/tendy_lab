import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextOf, validateStory, type Scene } from './av-story'

const s = (id: string, extra: Partial<Scene> = {}): Scene => ({ id, title: `Cap ${id}`, video: `v/${id}`, ending: false, choices: [], ...extra })

test('historia: 1 capítulo sin nada es válida y termina en la misión', () => {
  const story = { scenes: [s('1')] }
  assert.deepEqual(validateStory(story), { errors: [], warnings: [] })
  assert.equal(nextOf(story, '1'), 'mission')
})
test('historia: lineal recorre en orden y el último va a la misión', () => {
  const story = { scenes: [s('1'), s('2'), s('3')] }
  assert.equal(nextOf(story, '1'), '2')
  assert.equal(nextOf(story, '2'), '3')
  assert.equal(nextOf(story, '3'), 'mission')
})
test('historia: ramas con capítulo siguiente y final son válidas', () => {
  const story = { scenes: [
    s('1', { choices: [{ label: 'Bosque', next: 'A' }, { label: 'Casa', next: 'B' }] }),
    s('A', { next: 'F' }), s('B', { ending: true }), s('F'),
  ] }
  assert.deepEqual(validateStory(story).errors, [])
  assert.equal(nextOf(story, 'A'), 'F')
  assert.equal(nextOf(story, 'B'), 'mission')
})
test('historia: una sola opción es error', () => {
  const r = validateStory({ scenes: [s('1', { choices: [{ label: 'x', next: '2' }] }), s('2')] })
  assert.equal(r.errors.length, 1)
  assert.match(r.errors[0], /Cap 1/)
})
test('historia: opción o siguiente a un capítulo que no existe es error', () => {
  assert.equal(validateStory({ scenes: [s('1', { choices: [{ label: 'a', next: '2' }, { label: 'b', next: '99' }] }), s('2')] }).errors.length, 1)
  assert.equal(validateStory({ scenes: [s('1', { next: '99' })] }).errors.length, 1)
})
test('historia: ciclo sin salida a la misión es error', () => {
  const r = validateStory({ scenes: [s('1', { next: '2' }), s('2', { next: '1' }), s('3')] })
  assert.ok(r.errors.some(e => /vueltas/.test(e)))
})
test('historia: capítulo inalcanzable es solo aviso', () => {
  const r = validateStory({ scenes: [s('1', { ending: true }), s('2')] })
  assert.deepEqual(r.errors, [])
  assert.equal(r.warnings.length, 1)
  assert.match(r.warnings[0], /Cap 2/)
})
test('historia: sin capítulos, sin título o sin video es error', () => {
  assert.equal(validateStory({ scenes: [] }).errors.length, 1)
  assert.equal(validateStory({ scenes: [s('1', { video: '' })] }).errors.length, 1)
  assert.equal(validateStory({ scenes: [s('1', { title: ' ' })] }).errors.length, 1)
})
