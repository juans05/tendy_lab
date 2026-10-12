import test from 'node:test'
import assert from 'node:assert/strict'
import { checkScript } from './creation'
const scene = (start: number, end: number, say = 'Mira este producto') => ({ start, end, say, shot: 'Plano detalle', on_screen: '' })
test('guion: cubre 15, 30 y 60 segundos', () => {
  for (const duration of [15, 30, 60]) assert.doesNotThrow(() => checkScript({ title: 'Producto', tips: ['Ensaya'], scenes: [scene(0, 3), scene(3, duration - 3), scene(duration - 3, duration)] }, duration))
})
test('guion: rechaza huecos y texto que no cabe', () => {
  assert.throws(() => checkScript({ title: '', tips: [], scenes: [scene(0, 3), scene(4, 15)] }, 15))
  assert.throws(() => checkScript({ title: '', tips: [], scenes: [scene(0, 1, 'palabra '.repeat(10)), scene(1, 15)] }, 15))
  assert.throws(() => checkScript({ title: '', tips: [], scenes: [scene(0, 10)] }, 15))
})
