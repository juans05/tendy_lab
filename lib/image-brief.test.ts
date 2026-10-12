import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ImageBrief, imagePrompt, referenceNote } from './image-brief'
const brief = { format: '4:5', kind: 'Anuncio de café', theme: 'Bolsa de café en una mesa de madera con luz cálida', style: 'Foto realista', exact_text: 'Café para tu mañana', typography: 'Sans serif', palette: 'Azul y crema', avoid: 'Confeti' }
test('imagen: siete líneas con texto literal y contexto de marca', () => {
  const p = imagePrompt(ImageBrief.parse(brief), { name: 'Mi café', audience: 'Familias', avoid: 'Descuentos' })
  assert.equal(p.split('\n').length, 7)
  assert.ok(p.includes('Café para tu mañana'))
  assert.ok(p.includes('Familias') && p.includes('Confeti') && p.includes('Descuentos'))
  assert.ok(p.includes('Público: "Familias"'))
  assert.ok(!p.includes('\\"name\\"'))
  assert.ok(imagePrompt(ImageBrief.parse({ ...brief, exact_text: '' }), {}).includes('Sin letras'))
})
test('imagen: rechaza formato, estilo y tema inválidos', () => {
  for (const b of [{ ...brief, format: '100:1' }, { ...brief, style: 'Desconocido' }, { ...brief, theme: 'café' }]) assert.equal(ImageBrief.safeParse(b).success, false)
})
test('imagen: referencias opcionales como producto o estilo, sin copiar textos ni logos ajenos', () => {
  assert.equal(referenceNote(0), '')
  const n = referenceNote(2)
  assert.ok(n.includes('2 imágenes de referencia') && n.includes('producto') && n.includes('estilo') && n.includes('logos'))
})
