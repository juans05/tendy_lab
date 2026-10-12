import { migrate } from './lib/db'
import { startWorker } from './lib/worker'

export async function init() {
  await migrate()
  startWorker() // un solo proceso: web + worker; Postgres es la cola
}
