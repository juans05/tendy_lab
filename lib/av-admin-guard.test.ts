import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Un layout no protege sus páginas (con renderizado parcial se puede pedir solo el segmento de la página):
// cada página del admin de aventuras debe llamar a requireAdmin() por sí misma.
const pages = (dir: string): string[] => readdirSync(dir).flatMap(f => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? pages(p) : f === 'page.tsx' ? [p] : []
})

test('admin aventuras: toda página verifica el rol de admin', () => {
  const list = pages(join(process.cwd(), 'app', 'admin', 'aventuras'))
  assert.ok(list.length >= 6)
  const missing = list.filter(p => !/await requireAdmin\(\)/.test(readFileSync(p, 'utf8')))
  assert.deepEqual(missing, [])
})
