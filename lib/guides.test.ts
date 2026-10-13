import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GUIDES } from './guides'
test('guías: completas y con fuente oficial https', () => {
  assert.deepEqual(Object.keys(GUIDES).sort(), ['landing-page', 'meta-ads', 'prompts-imagenes', 'ruc-10', 'whatsapp-business'])
  for (const [slug, g] of Object.entries(GUIDES)) {
    assert.equal(g.slug, slug)
    assert.ok(g.steps.length >= 4 && g.mistakes.length >= 2, slug)
    assert.ok(g.sources.length >= 1 && g.sources.every(([, url]) => url.startsWith('https://')), slug)
  }
})
