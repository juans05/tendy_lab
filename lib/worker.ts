import { q } from './db'
import { refund } from './credits'
import { handlers, type Run } from './tools'
import { purgeExpired } from './av-album'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const CONCURRENCY = 2

// La cola es la tabla runs: FOR UPDATE SKIP LOCKED reparte jobs sin Redis.
async function tick() {
  const [run] = await q<Run & { cost: number }>(
    `update runs set status='RUNNING', started_at=now()
     where id=(select id from runs where status='QUEUED' order by id for update skip locked limit 1)
     returning id,user_id,tool,input,cost`)
  if (!run) return false
  try {
    const activeHandlers = (globalThis as any).__toolHandlers ?? handlers
    const result = await activeHandlers[run.tool](run)
    await q(`update runs set status='COMPLETED', result=$2, finished_at=now() where id=$1`, [run.id, result])
  } catch (e: any) {
    console.error(`run ${run.id} falló:`, e.message)
    // Errores del proveedor de IA pueden incluir datos de la clave: al usuario solo un mensaje genérico.
    const msg = e?.status ? 'El servicio de IA no respondió correctamente. Inténtalo más tarde' : String(e.message).slice(0, 300)
    await q(`update runs set status='FAILED', error=$2, finished_at=now() where id=$1`, [run.id, msg])
    await refund(run.id, run.user_id, run.cost)
  }
  return true
}

// Rescata runs colgados (reserva con timeout) y aplica retención de 30 días a los archivos.
async function housekeeping() {
  const stuck = await q<{ id: string; user_id: string; cost: number }>(
    `update runs set status='FAILED', error='Tiempo agotado', finished_at=now()
     where status='RUNNING' and started_at < now() - interval '10 minutes' returning id,user_id,cost`)
  for (const r of stuck) await refund(r.id, r.user_id, r.cost)
  await q(`delete from assets where created_at < now() - interval '30 days'`)
  await q(`delete from sessions where expires_at < now()`)
  await purgeExpired() // Tendy Aventuras: fotos vencidas y sesiones de álbum
}

export function startWorker() {
  const g = globalThis as any
  g.__toolHandlers = handlers
  if (g.__worker) return
  g.__worker = true
  for (let i = 0; i < CONCURRENCY; i++)
    (async () => {
      for (;;) {
        try { if (!(await tick())) await sleep(1500) } catch (e) { console.error('worker:', e); await sleep(5000) }
      }
    })()
  ;(async () => {
    for (;;) {
      try { await housekeeping() } catch (e) { console.error('housekeeping:', e) }
      await sleep(60_000)
    }
  })()
}
