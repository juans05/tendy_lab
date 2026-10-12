import { test } from 'node:test'
import assert from 'node:assert/strict'
import { attemptKey, loginGuard } from './login-guard'
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
test('login: los fallos desde otra IP no bloquean al dueño de la cuenta', () => {
  const g = loginGuard(5, 15 * 60_000)
  const atacante = attemptKey('a@b.c', new Headers({ 'x-forwarded-for': '1.1.1.1, 9.9.9.9' }))
  const dueno = attemptKey('a@b.c', new Headers({ 'x-forwarded-for': '2.2.2.2' }))
  for (let i = 0; i < 5; i++) g.fail(atacante, i)
  assert.equal(g.blocked(atacante, 10), true)
  assert.equal(g.blocked(dueno, 10), false)
  // la IP inventada al inicio de x-forwarded-for no cambia la clave
  assert.equal(attemptKey('a@b.c', new Headers({ 'x-forwarded-for': '7.7.7.7, 9.9.9.9' })), atacante)
})
test('login: cambiar de IP no salta el tope por correo', () => {
  const ip = loginGuard(5, 15 * 60_000), mail = loginGuard(50, 15 * 60_000)
  const blocked = (k: string) => ip.blocked(k, 100) || mail.blocked('a@b.c', 100)
  for (let i = 0; i < 50; i++) { const k = attemptKey('a@b.c', new Headers({ 'x-forwarded-for': `10.0.0.${i}` })); ip.fail(k, i); mail.fail('a@b.c', i) }
  assert.equal(blocked(attemptKey('a@b.c', new Headers({ 'x-forwarded-for': '10.0.1.1' }))), true)
})
