import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fitCards } from './av-print-layout'

const RATIO = 1128 / 1600 // proporción de la tarjeta (ancho / alto)

test('impresión: 2 por A4 horizontal caben con margen de 10 mm y separación', () => {
  const f = fitCards({ w: 297, h: 210 }, 2, 1)
  assert.ok(f.cardW * 2 + f.gap + 2 * f.margin <= 297 + 0.01)
  assert.ok(f.cardH + 2 * f.margin <= 210 + 0.01)
  assert.ok(Math.abs(f.cardW / f.cardH - RATIO) < 0.001)
  assert.equal(f.margin, 10)
  assert.ok(f.cardW > 130) // aprovecha la hoja: casi A5
})

test('impresión: 4 por A4 vertical y 1 por A5 también respetan márgenes y proporción', () => {
  for (const [page, cols, rows] of [[{ w: 210, h: 297 }, 2, 2], [{ w: 148, h: 210 }, 1, 1]] as const) {
    const f = fitCards(page, cols, rows)
    assert.ok(cols * f.cardW + (cols - 1) * f.gap + 2 * f.margin <= page.w + 0.01)
    assert.ok(rows * f.cardH + (rows - 1) * f.gap + 2 * f.margin <= page.h + 0.01)
    assert.ok(Math.abs(f.cardW / f.cardH - RATIO) < 0.001)
  }
})
