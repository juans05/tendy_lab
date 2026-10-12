import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wantsCutout } from './cutout'

test('foto: quitar el fondo usa el recorte real', () => {
  assert.equal(wantsCutout('sinfondo'), true)
  for (const r of ['Quita el fondo', 'quítale el fondo por favor', 'Elimínale el fondo', 'borra todo el fondo', 'remueve el fondo', 'sácale el fondo', 'déjalo sin fondo', 'fondo transparente'])
    assert.equal(wantsCutout('libre', r), true, r)
  for (const r of ['Ponlo sobre un fondo de mármol', 'Agrega hojas de menta alrededor', 'Cambia el fondo a azul'])
    assert.equal(wantsCutout('libre', r), false, r)
  assert.equal(wantsCutout('catalogo', 'quita el fondo'), false)
})
