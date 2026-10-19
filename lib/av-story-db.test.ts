// Solo con TEST_DB=1 contra la BD local. Nunca contra la BD real del .env.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const ON = process.env.TEST_DB === '1' && /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? '')
const opts = { skip: !ON && 'requiere TEST_DB=1 y BD local' }

async function adventure() {
  const { q } = await import('./db')
  const [c] = await q<{ id: string }>(`select id from collections where slug='halloween'`)
  const [a] = await q<{ id: string }>(`insert into adventures(slug,collection_id,title,description) values($1,$2,'T','D') returning id`, [`t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, c.id])
  return String(a.id)
}
const base = { title: 'Nueva', description: 'Desc', minutes: 4, cover: null, mission: { title: 'M', text: 'Pinta', tips: ['a'] } }

test('guardar historia: capítulos nuevos con ids temporales, opciones y siguiente', opts, async () => {
  const { saveStory, loadStory } = await import('./av-story-db')
  const id = await adventure()
  await saveStory(id, { ...base, scenes: [
    { id: 'n1', title: 'Inicio', video: 'v/1', ending: false, choices: [{ label: 'A', next: 'n2' }, { label: 'B', next: 'n3' }] },
    { id: 'n2', title: 'Rama A', video: 'v/2', next: 'n4', ending: false, choices: [] },
    { id: 'n3', title: 'Rama B', video: 'v/3', ending: true, choices: [] },
    { id: 'n4', title: 'Final', video: 'v/4', ending: false, choices: [] },
  ] })
  const s = await loadStory(id)
  assert.deepEqual(s.scenes.map(x => x.title), ['Inicio', 'Rama A', 'Rama B', 'Final'])
  assert.deepEqual(s.scenes[0].choices.map(c => c.next), [s.scenes[1].id, s.scenes[2].id])
  assert.equal(s.scenes[1].next, s.scenes[3].id)
  assert.equal(s.scenes[2].ending, true)
})

test('guardar historia: reordena, edita y borra los que ya no están', opts, async () => {
  const { saveStory, loadStory } = await import('./av-story-db')
  const id = await adventure()
  await saveStory(id, { ...base, scenes: [
    { id: 'n1', title: 'Uno', video: 'v/1', ending: false, choices: [] },
    { id: 'n2', title: 'Dos', video: 'v/2', ending: false, choices: [] },
    { id: 'n3', title: 'Tres', video: 'v/3', ending: false, choices: [] },
  ] })
  const [one, two] = (await loadStory(id)).scenes
  await saveStory(id, { ...base, scenes: [
    { id: two.id, title: 'Dos editado', video: 'v/2b', description: 'hola', ending: false, choices: [] },
    { id: one.id, title: 'Uno', video: 'v/1', ending: false, choices: [] },
  ] })
  const s = await loadStory(id)
  assert.deepEqual(s.scenes.map(x => [x.id, x.title, x.video]), [[two.id, 'Dos editado', 'v/2b'], [one.id, 'Uno', 'v/1']])
  assert.equal(s.scenes[0].description, 'hola')
})

test('guardar historia: si estaba publicada y queda inválida, se despublica', opts, async () => {
  const { saveStory } = await import('./av-story-db')
  const { q } = await import('./db')
  const id = await adventure()
  await saveStory(id, { ...base, scenes: [{ id: 'n1', title: 'Uno', video: 'v/1', ending: false, choices: [] }] })
  await q(`update adventures set published=true where id=$1`, [id])
  const r = await saveStory(id, { ...base, scenes: [{ id: 'n1', title: 'Uno', video: 'v/1', ending: false, choices: [{ label: 'sola', next: 'n1' }] }] })
  assert.equal(r.unpublished, true)
  assert.ok(r.errors.length > 0)
  assert.equal((await q(`select published from adventures where id=$1`, [id]))[0].published, false)
})

test('guardar historia: no puede tocar capítulos de otra aventura', opts, async () => {
  const { saveStory, loadStory } = await import('./av-story-db')
  const a = await adventure(), b = await adventure()
  await saveStory(a, { ...base, scenes: [{ id: 'n1', title: 'De A', video: 'v/a', ending: false, choices: [] }] })
  const foreign = (await loadStory(a)).scenes[0].id
  await saveStory(b, { ...base, scenes: [{ id: foreign, title: 'Robado', video: 'v/b', ending: false, choices: [] }] })
  assert.equal((await loadStory(a)).scenes[0].title, 'De A')
  assert.equal((await loadStory(b)).scenes[0].title, 'Robado') // se creó como capítulo nuevo de B
})
