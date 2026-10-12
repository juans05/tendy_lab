import { test } from 'node:test'
import assert from 'node:assert/strict'
import { socialUrl } from './social-download'
test('enlaces: solo publicaciones HTTPS de los dominios permitidos', () => {
  assert.equal(socialUrl('https://www.instagram.com/reel/abc/?utm_source=x'), 'https://www.instagram.com/reel/abc/')
  assert.equal(socialUrl('https://www.instagram.com/reels/DePg-FDoIWB/'), 'https://www.instagram.com/reels/DePg-FDoIWB/')
  assert.equal(socialUrl('https://www.tiktok.com/@tienda/video/123'), 'https://www.tiktok.com/@tienda/video/123')
  for (const url of ['http://www.instagram.com/reel/abc', 'https://localhost/reel/abc', 'https://instagram.com.ejemplo.com/reel/abc', 'https://www.instagram.com/', 'https://user:pass@www.instagram.com/reel/abc', 'https://www.instagram.com:8443/reel/abc']) assert.throws(() => socialUrl(url))
})
