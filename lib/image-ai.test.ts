import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openaiSize } from './image-ai'
test('imagen: tamaño de OpenAI más cercano a la proporción pedida', () => {
  assert.equal(openaiSize('1:1'), '1024x1024')
  for (const a of ['9:16', '4:5', '3:4', '2:3']) assert.equal(openaiSize(a), '1024x1536')
  for (const a of ['16:9', '5:4', '21:9']) assert.equal(openaiSize(a), '1536x1024')
  assert.equal(openaiSize(), 'auto') // foto de producto: conserva la proporción original
})
