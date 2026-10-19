// Solo con TEST_DB=1 contra la BD local. Nunca contra la BD real del .env.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const ON = process.env.TEST_DB === '1' && /localhost|127.0.0.1/.test(process.env.DATABASE_URL ?? '')

test('aventuras: semilla de Fantasmín sin publicar y sin capítulos', { skip: !ON && 'requiere TEST_DB=1 y BD local' }, async () => {
  const { q, migrate } = await import('./db')
  await migrate()
  const [a] = await q(`select a.id,a.published,a.mission,c.slug as col from adventures a join collections c on c.id=a.collection_id where a.slug='fantasmin'`)
  assert.equal(a.published, false)
  assert.equal(a.col, 'halloween')
  assert.equal(a.mission.title, '¡Ahora empieza tu misión!')
  assert.equal((await q(`select count(*)::int n from story_scenes where adventure_id=$1`, [a.id]))[0].n, 0)
  await assert.rejects(q(`insert into adventures(slug,collection_id,title,description) values('mis-fotos',$1,'x','x')`, [(await q(`select id from collections where slug='halloween'`))[0].id]))
})

test('aventuras: ajustes con valores por defecto y guardado parcial', { skip: !ON && 'requiere TEST_DB=1 y BD local' }, async () => {
  const { q } = await import('./db')
  const { getSettings, saveSettings } = await import('./av-settings')
  await q(`delete from av_settings`)
  const d = await getSettings()
  assert.deepEqual(d, { uploads_enabled: true, max_photo_mb: 8, max_photos_per_kit: 3, retention_days: 365, consent_version: 'v1-2026-10', kits_url: 'https://tendyperu.com' })
  await saveSettings({ uploads_enabled: false, retention_days: 90 })
  const s = await getSettings()
  assert.equal(s.uploads_enabled, false)
  assert.equal(s.retention_days, 90)
  assert.equal(s.max_photo_mb, 8)
  await q(`delete from av_settings`)
})
