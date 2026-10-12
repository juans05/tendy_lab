import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkGrounded } from './selling'
test('venta: no se aceptan cifras que el usuario no escribió', () => {
  const input = 'Polo de algodón a S/ 45, envío Lima 24 h, Yape o Plin'
  assert.doesNotThrow(() => checkGrounded(['Cuesta S/ 45 y llega en 24 h', 'Envío: [completa: costo de envío]'], input))
  assert.doesNotThrow(() => checkGrounded(['Precio: S/45.00'], input)) // mismo número con otro formato
  assert.throws(() => checkGrounded(['Hoy con 20% de descuento'], input))
  assert.throws(() => checkGrounded(['Envío gratis por compras desde S/ 100'], input))
})
