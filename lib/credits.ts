import { q } from './db'

// Monedas en décimas (0.5 moneda = 5) para no usar floats. Costos según funcional 7.2.
export const COST = { profit: 0, hooks: 10, creativo: 10, video: 30, guion: 10, foto: 30, transcribir: 100, imagen: 30, whatsapp: 0, copy: 0 } as const
export type Tool = keyof typeof COST
export const SIGNUP_GRANT = 50
// Plataforma gratis; se pagan solo las monedas. Precios en soles; PACKS en monedas de pantalla (1 moneda = 10 décimas).
export const PACKS = [{ credits: 25, soles: 10 }, { credits: 70, soles: 25 }]
export const FREE_MONTHLY = 20 // usos al mes por herramienta gratis con IA, sin plan
export const FREE_CAPPED: readonly string[] = ['whatsapp', 'copy']
export const fmt = (t: number) => (t / 10).toFixed(1).replace(/\.0$/, '')
export const coins = (t: number) => `${fmt(t)} moneda${t === 10 ? '' : 's'}` // una sola moneda en toda la app

export async function balance(userId: string) {
  return (await q<{ b: number }>('select coalesce(sum(amount),0)::int b from ledger where user_id=$1', [userId]))[0].b
}
// Idempotente: un run solo se devuelve una vez.
export async function refund(runId: string, userId: string, cost: number) {
  if (cost > 0)
    await q(`insert into ledger(user_id,run_id,type,amount,idem) values($1,$2,'RUN_REFUND',$3,$4) on conflict(idem) do nothing`,
      [userId, runId, cost, `refund:${runId}`])
}
