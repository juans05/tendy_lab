import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkWeek, dayIndex, limaToday, spreadDays, weekDays } from './plans'

test('plan: reparte las publicaciones parejas en la semana', () => {
  assert.deepEqual(spreadDays(1), [0])
  assert.deepEqual(spreadDays(2), [0, 3])
  assert.deepEqual(spreadDays(3), [0, 2, 4])
  assert.deepEqual(spreadDays(4), [0, 1, 3, 5])
  assert.deepEqual(spreadDays(7), [0, 1, 2, 3, 4, 5, 6])
})

test('plan: "hoy" cambia a medianoche de Lima, no de UTC', () => {
  assert.equal(limaToday(new Date('2026-10-17T03:30:00Z')), '2026-10-16')
  assert.equal(limaToday(new Date('2026-10-17T05:30:00Z')), '2026-10-17')
})

test('plan: días transcurridos desde el inicio', () => {
  assert.equal(dayIndex('2026-10-16', '2026-10-16'), 0)
  assert.equal(dayIndex('2026-10-16', '2026-10-22'), 6)
  assert.equal(dayIndex('2026-10-16', '2026-11-06'), 21)
})

const post = (topic: string, hook: string, format = 'Reel') => ({ format: format as any, topic, hook, shots: ['Toma de detalle del producto'], caption: 'Escríbenos por mensaje y te contamos más.', hashtags: ['#a', '#b', '#c'] })
const week = (posts: ReturnType<typeof post>[]) => ({ plan_name: 'Termo', product_context: 'Termo de acero color negro con tapa a rosca, visto de frente.', posts })
const ctx = { days: 3, platform: 'Instagram' as const, prevTopics: [] as string[], facts: 'Termo de acero' }
const valid = () => [post('Cómo se ve por dentro', 'Mira lo que nadie te muestra'), post('Tres usos en el día', 'Desde el desayuno hasta la noche'), post('Antes y después del café', 'Tu café sigue caliente en la tarde', 'Carrusel')]

test('plan: cada publicación cae en su día y el resto es descanso', () => {
  const [a, b, c] = valid()
  assert.deepEqual(weekDays([a, b, c], 3), [a, null, b, null, c, null, null])
})

test('plan: acepta una semana válida', () => {
  assert.doesNotThrow(() => checkWeek(week(valid()), ctx))
})

test('plan: rechaza semanas inválidas', () => {
  assert.throws(() => checkWeek(week(valid().slice(0, 2)), ctx))
  const [a, b] = valid()
  assert.throws(() => checkWeek(week([a, b, post('Una historia', 'Gancho distinto aquí', 'Historia')]), { ...ctx, platform: 'TikTok' }))
  assert.throws(() => checkWeek(week([a, b, post('cómo se ve POR DENTRO', 'Otro gancho diferente')]), ctx))
  assert.throws(() => checkWeek(week(valid()), { ...ctx, prevTopics: ['Tres usos en el día'] }))
  const priced = valid(); priced[0] = { ...priced[0], caption: 'Hoy a solo S/ 45, escríbenos.' }
  assert.throws(() => checkWeek(week(priced), ctx))
})
