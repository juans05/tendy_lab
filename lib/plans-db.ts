import { q, tx } from './db'
import { createRunTx } from './runs'
import { limaToday } from './plans'

// Crea la semana n del plan y su run (con el cobro) en una sola transacción.
// unique(plan_id,n) hace que abrir el plan dos veces no cobre dos semanas: la segunda revierte.
// Si la semana n falló (monedas ya devueltas por el worker), se reemplaza.
export async function startWeek(userId: string, planId: string, n: number, input: object) {
  return tx(async c => {
    const { rows: [plan] } = await c.query('select id from content_plans where id=$1 and user_id=$2 for update', [planId, userId])
    if (!plan) throw new Error('Plan no encontrado')
    await c.query(`delete from plan_weeks w using runs r where w.plan_id=$1 and w.n=$2 and r.id=w.run_id and r.status='FAILED'`, [planId, n])
    const runId = await createRunTx(c, userId, 'semana', { ...input, plan_id: planId, week: n })
    await c.query('insert into plan_weeks(plan_id,n,run_id,start) values($1,$2,$3,$4)', [planId, n, runId, limaToday()])
    return runId
  })
}

// Input de las semanas siguientes: sin fotos (pueden haberse borrado a los 30 días), con la descripción guardada
// y los temas ya usados para no repetirlos.
export async function weekInput(planId: string) {
  const [p] = await q(`select p.platform,p.objective,p.days,p.description,p.visual_spec,p.context,u.brand
    from content_plans p join users u on u.id=p.user_id where p.id=$1`, [planId])
  const rows = await q<{ topic: string }>(`select x->>'topic' topic from plan_weeks w join runs r on r.id=w.run_id,
    jsonb_array_elements(r.result->'posts') x where w.plan_id=$1 and r.status='COMPLETED' order by w.n desc limit 60`, [planId])
  return { platform: p.platform, objective: p.objective, days: p.days, description: p.description, visual_spec: p.visual_spec, context: p.context, prev_topics: rows.map(r => r.topic), brand: p.brand, assets: [] }
}
