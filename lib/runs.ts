import type { PoolClient } from 'pg'
import { tx } from './db'
import { COST, FREE_CAPPED, FREE_MONTHLY, type Tool } from './credits'

export class NoCredits extends Error {}
export class FreeLimit extends Error {}

// Reserva monedas y crea el run en la misma transacción. El lock de la fila del usuario
// serializa los débitos concurrentes: no se puede gastar más que el saldo.
export async function createRun(userId: string, tool: Tool, input: object, result: object | null = null) {
  return tx(c => createRunTx(c, userId, tool, input, result))
}
// Igual que createRun, dentro de una transacción ajena (p. ej. crear la semana de un plan junto con su run).
export async function createRunTx(c: PoolClient, userId: string, tool: Tool, input: object, result: object | null = null) {
  const cost = COST[tool]
  const status = result ? 'COMPLETED' : 'QUEUED'
  await c.query('select 1 from users where id=$1 for update', [userId])
  if (FREE_CAPPED.includes(tool)) {
    const { rows: [{ n }] } = await c.query(`select count(*)::int n from runs where user_id=$1 and tool=$2 and created_at >= date_trunc('month', now())`, [userId, tool])
    if (n >= FREE_MONTHLY) throw new FreeLimit()
  }
  const { rows: [{ b }] } = await c.query('select coalesce(sum(amount),0)::int b from ledger where user_id=$1', [userId])
  if (b < cost) throw new NoCredits()
  const { rows: [r] } = await c.query(
    `insert into runs(user_id,tool,status,input,result,cost,finished_at)
     values($1,$2,$3,$4,$5,$6, case when $3::text='COMPLETED' then now() end) returning id`,
    [userId, tool, status, input, result, cost])
  if (cost > 0)
    await c.query(`insert into ledger(user_id,run_id,type,amount) values($1,$2,'RUN_RESERVE',$3)`, [userId, r.id, -cost])
  return r.id as string
}
