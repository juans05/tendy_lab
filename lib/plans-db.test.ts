// Solo con TEST_DB=1 contra la BD local (npm run db). Nunca contra la BD real del .env.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const ON = process.env.TEST_DB === '1' && /localhost/.test(process.env.DATABASE_URL ?? '')

test('plan: una semana se cobra una sola vez y se reintenta si falló', { skip: !ON && 'requiere TEST_DB=1 y BD local' }, async () => {
  const { q } = await import('./db')
  const { balance } = await import('./credits')
  const { startWeek, weekInput } = await import('./plans-db')
  const [u] = await q<{ id: string }>(`insert into users(email,pass) values($1,'x') returning id`, [`plan-${Date.now()}@test.local`])
  try {
    await q(`insert into ledger(user_id,type,amount) values($1,'ADMIN_ADJUST',100)`, [u.id])
    const [p] = await q<{ id: string }>(`insert into content_plans(user_id,platform,objective,days) values($1,'Instagram','ventas',3) returning id`, [u.id])
    const run1 = await startWeek(u.id, p.id, 1, { days: 3 })
    assert.equal(await balance(u.id), 50)
    await assert.rejects(startWeek(u.id, p.id, 1, { days: 3 }))
    assert.equal(await balance(u.id), 50)
    await q(`update runs set status='FAILED' where id=$1`, [run1])
    await q(`insert into ledger(user_id,run_id,type,amount) values($1,$2,'RUN_REFUND',50)`, [u.id, run1])
    const run2 = await startWeek(u.id, p.id, 1, { days: 3 })
    assert.notEqual(run2, run1)
    const weeks = await q(`select run_id from plan_weeks where plan_id=$1`, [p.id])
    assert.deepEqual(weeks.map(w => String(w.run_id)), [String(run2)])
    assert.equal(await balance(u.id), 50)
    await q(`update runs set status='COMPLETED', result=$2 where id=$1`, [run2, { posts: [{ topic: 'Cómo se ve por dentro' }, { topic: 'Tres usos' }] }])
    const next = await weekInput(p.id)
    assert.deepEqual([...next.prev_topics].sort(), ['Cómo se ve por dentro', 'Tres usos'])
    assert.equal(next.days, 3)
  } finally {
    await q(`delete from runs where user_id=$1`, [u.id])
    await q(`delete from users where id=$1`, [u.id])
  }
})
