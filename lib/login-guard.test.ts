import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loginGuard } from './login-guard'
test('login: bloquea tras 5 fallos en 15 minutos y se libera después', () => {
  const g = loginGuard(5, 15 * 60_000)
  const t0 = 1_000_000
  for (let i = 0; i < 5; i++) { assert.equal(g.blocked('a@b.c', t0 + i), false); g.fail('a@b.c', t0 + i) }
  assert.equal(g.blocked('a@b.c', t0 + 10), true)
  assert.equal(g.blocked('A@B.C ', t0 + 10), true) // mismo correo escrito distinto
  assert.equal(g.blocked('otro@b.c', t0 + 10), false)
  assert.equal(g.blocked('a@b.c', t0 + 15 * 60_000 + 10), false) // pasó la ventana
})
test('login: un acceso correcto limpia los fallos', () => {
  const g = loginGuard(5, 15 * 60_000)
  for (let i = 0; i < 4; i++) g.fail('a@b.c', i)
  g.ok('a@b.c'); g.fail('a@b.c', 5)
  assert.equal(g.blocked('a@b.c', 6), false)
})
