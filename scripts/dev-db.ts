// Postgres local real (binarios embebidos) para desarrollo y pruebas, sin Docker. Dejar corriendo.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'

const pg = new EmbeddedPostgres({ databaseDir: './.pgdata', user: 'tendy', password: 'tendy', port: 5432, persistent: true })
async function main() {
if (!existsSync('./.pgdata/PG_VERSION')) await pg.initialise()
await pg.start()
await pg.createDatabase('tendy').catch(() => {}) // ya existe
console.log('Postgres listo: postgres://tendy:tendy@localhost:5432/tendy')
}
main()
