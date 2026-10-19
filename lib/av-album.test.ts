// Solo con TEST_DB=1 contra la BD local. Nunca contra la BD real del .env.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'

const ON = process.env.TEST_DB === '1' && /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? '')
const opts = { skip: !ON && 'requiere TEST_DB=1 y BD local' }
process.env.MEDIA_ENC_KEY ??= randomBytes(32).toString('base64')

async function kit() {
  const { q } = await import('./db')
  const { newCode } = await import('./av-codes')
  const [a] = await q<{ id: string }>(`select id from adventures where slug='fantasmin'`)
  const code = newCode()
  const [k] = await q<{ id: string }>(`insert into qr_codes(code,adventure_id,batch) values($1,$2,'test') returning id`, [code, a.id])
  return { id: String(k.id), code }
}
const S = { uploads_enabled: true, max_photo_mb: 8, max_photos_per_kit: 3, retention_days: 365, consent_version: 'v-test', kits_url: '' }
const photo = Buffer.from('foto')

test('álbum: el PIN se crea una sola vez y luego se verifica', opts, async () => {
  const { setPin, verifyPin } = await import('./av-album')
  const k = await kit()
  assert.equal((await verifyPin(k.code, '4826')).status, 'nopin')
  assert.equal(await setPin(k.id, '4826'), true)
  assert.equal(await setPin(k.id, '7351'), false) // nadie pisa un PIN ya creado
  assert.equal((await verifyPin(k.code, '7351')).status, 'bad')
  assert.deepEqual(await verifyPin(k.code, '4826'), { status: 'ok', kitId: k.id })
  assert.equal((await verifyPin('TP-22222222', '4826')).status, 'nokit')
})

test('álbum: 5 PIN errados bloquean aunque luego llegue el correcto', opts, async () => {
  const { setPin, verifyPin } = await import('./av-album')
  const k = await kit()
  await setPin(k.id, '4826')
  for (let i = 0; i < 5; i++) assert.equal((await verifyPin(k.code, '0000')).status, 'bad')
  assert.equal((await verifyPin(k.code, '4826')).status, 'locked')
})

test('álbum: dos subidas simultáneas no superan el tope de 3 fotos', opts, async () => {
  const { savePhotos } = await import('./av-album')
  const { q } = await import('./db')
  const k = await kit()
  const r = await Promise.allSettled([savePhotos(k.id, [photo, photo], ['store'], S), savePhotos(k.id, [photo, photo], ['store'], S)])
  assert.equal(r.filter(x => x.status === 'fulfilled').length, 1)
  assert.equal((await q(`select count(*)::int n from media_files where qr_code_id=$1`, [k.id]))[0].n, 2)
  assert.equal((await q(`select count(*)::int n from consent_records where qr_code_id=$1`, [k.id]))[0].n, 2)
})

test('álbum: la foto se guarda cifrada con consentimientos por foto y fecha de borrado', opts, async () => {
  const { savePhotos, readPhoto } = await import('./av-album')
  const { q } = await import('./db')
  const k = await kit()
  const [id] = await savePhotos(k.id, [Buffer.from('RIFFxxxxWEBP')], ['store', 'gallery'], S)
  const [m] = await q(`select data,delete_after>now()+interval '364 days' as later from media_files where id=$1`, [id])
  assert.ok(!m.data.includes(Buffer.from('WEBP')))
  assert.equal(m.later, true)
  assert.deepEqual((await q(`select purpose,version from consent_records where media_file_id=$1 order by purpose`, [id])).map(r => r.purpose + ':' + r.version), ['gallery:v-test', 'store:v-test'])
  assert.deepEqual(await readPhoto(id, k.id), Buffer.from('RIFFxxxxWEBP'))
  assert.equal(await readPhoto(id, (await kit()).id), null) // otro kit no la ve
})

test('álbum: la sesión solo abre su kit y se borra con "borrar todo"', opts, async () => {
  const { createAlbumToken, kitForToken, savePhotos, deleteAll } = await import('./av-album')
  const { q } = await import('./db')
  const k = await kit()
  const t = await createAlbumToken(k.id)
  assert.equal((await kitForToken(t))?.id, k.id)
  assert.equal(await kitForToken('inventado'), null)
  await savePhotos(k.id, [photo], ['store'], S)
  await deleteAll(k.id)
  assert.equal(await kitForToken(t), null)
  assert.equal((await q(`select count(*)::int n from media_files where qr_code_id=$1`, [k.id]))[0].n, 0)
  assert.equal((await q(`select pin_hash from qr_codes where id=$1`, [k.id]))[0].pin_hash, null)
})

test('álbum: retirar galería devuelve una foto aprobada a pendiente', opts, async () => {
  const { savePhotos, revokeConsent } = await import('./av-album')
  const { q } = await import('./db')
  const k = await kit()
  const [id] = await savePhotos(k.id, [photo], ['store', 'gallery'], S)
  await q(`update media_files set moderation='approved' where id=$1`, [id])
  assert.equal(await revokeConsent(k.id, id, 'gallery'), true)
  assert.equal((await q(`select moderation from media_files where id=$1`, [id]))[0].moderation, 'pending')
  assert.equal((await q(`select count(*)::int n from consent_records where media_file_id=$1 and purpose='gallery' and revoked_at is not null`, [id]))[0].n, 1)
  assert.equal(await revokeConsent((await kit()).id, id, 'gallery'), false) // otro kit no puede
})

test('álbum: la purga borra fotos vencidas y sesiones expiradas, no las vigentes', opts, async () => {
  const { savePhotos, purgeExpired, createAlbumToken, kitForToken } = await import('./av-album')
  const { q } = await import('./db')
  const k = await kit()
  const [old, fresh] = await savePhotos(k.id, [photo, photo], ['store'], S)
  await q(`update media_files set delete_after=now()-interval '1 minute' where id=$1`, [old])
  const t = await createAlbumToken(k.id)
  await q(`update album_sessions set expires_at=now()-interval '1 minute'`)
  await purgeExpired()
  assert.deepEqual((await q(`select id from media_files where qr_code_id=$1`, [k.id])).map(r => r.id), [fresh])
  assert.equal(await kitForToken(t), null)
  assert.equal((await q(`select count(*)::int n from album_sessions where token_hash is not null and expires_at<now()`))[0].n, 0)
})

test('álbum: un PIN trivial no se puede crear', opts, async () => {
  const { setPin } = await import('./av-album')
  const k = await kit()
  assert.equal(await setPin(k.id, '1234'), false)
  assert.equal(await setPin(k.id, '4826'), true)
})
