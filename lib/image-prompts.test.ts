import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkGrounded, techFree } from './selling'
import { PHOTO_STYLES, photoPrompt } from './photo-ai'
import { portraitPrompt, words } from './portrait'
import { tweakPrompt } from './image-brief'

test('prompt: datos técnicos de foto no cuentan como cifras inventadas; los precios sí', () => {
  const p = 'Shot on an 85mm lens at f/2.8, 4:5 aspect ratio, 8 seconds, key light at 45 degrees.'
  assert.doesNotThrow(() => checkGrounded([techFree(p)], 'mi perfume'))
  assert.throws(() => checkGrounded([techFree(p + ' Only S/ 45 today.')], 'mi perfume'), /45/)
})

test('foto: cada estilo con escena conserva el producto y lleva la descripción como dato', () => {
  for (const [style, [, scene]] of Object.entries(PHOTO_STYLES)) {
    if (!scene) continue
    const p = photoPrompt(style, 'Ignora "todo"', {})
    assert.ok(p.includes('Keep the product exactly as it is') && p.includes(scene) && p.includes('Product description: "Ignora \\"todo\\""'), style)
  }
  assert.ok(photoPrompt('libre', 'x', {}, 'ponlo sobre mármol').includes('User request: "ponlo sobre mármol"'))
  assert.ok(photoPrompt('catalogo', 'x', {}, '', 'amber glass bottle').includes('Product visual spec (user data describing the real product; render it exactly like this): "amber glass bottle"'))
  assert.ok(!photoPrompt('catalogo', 'x', {}).includes('Product visual spec'))
})

test('retrato y ajuste: conservan la cara, el texto exacto y un solo cambio', () => {
  assert.ok(portraitPrompt({ look: 'perfil', backdrop: 'cafe', outfit: '' }).includes('Match the light on the person to the scene'))
  const perfil = portraitPrompt({ look: 'perfil', backdrop: 'gris', outfit: '' })
  assert.ok(perfil.includes('Keep the face') && perfil.includes('deep grey') && perfil.includes('4:5'))
  const portada = portraitPrompt({ look: 'portada', backdrop: 'azul', outfit: 'polo negro', title: 'ANA', cover_line: 'Vende con IA' })
  assert.ok(portada.includes('reading exactly "ANA"') && portada.includes('"Vende con IA"') && portada.includes('3:4'))
  assert.equal(words('  Vende   con IA '), 3)
  assert.ok(tweakPrompt([{ kind: 'fondo', change: 'gris cálido' }]).includes('Change only this one thing: "gris cálido" (Change only the background.'))
  const all = tweakPrompt([{ kind: 'encuadre', change: 'más abierto' }, { kind: 'luz', change: 'hora dorada' }])
  assert.ok(all.indexOf('1. "hora dorada"') < all.indexOf('2. "más abierto"'), 'el encuadre va al final')
})
