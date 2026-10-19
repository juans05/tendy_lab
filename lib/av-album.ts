import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { q, tx } from './db'
import { checkPass, hashPass } from './auth'
import { afterFail, pinLocked } from './av-pin'
import { decrypt, encrypt } from './av-crypto'
import type { AvSettings } from './av-settings'

// Fotos de un kit: se llega con el código (QR) + PIN del adulto. Sin cuentas ni datos personales.
const sha = (s: string) => createHash('sha256').update(s).digest('hex')
export type Purpose = 'store' | 'gallery' | 'ads'
export const PIN_RE = /^\d{4}$/

// Solo crea el PIN si el kit aún no tiene uno: nadie puede pisar el PIN del comprador.
export async function setPin(kitId: string, pin: string) {
  return (await q(`update qr_codes set pin_hash=$2,pin_fails=0,locked_until=null where id=$1 and pin_hash is null returning id`, [kitId, hashPass(pin)])).length > 0
}

export async function verifyPin(code: string, pin: string): Promise<{ status: 'ok' | 'bad' | 'locked' | 'nopin' | 'nokit'; kitId?: string }> {
  return tx(async c => {
    const [k] = (await c.query(`select id,pin_hash,pin_fails,locked_until from qr_codes where code=$1 for update`, [code])).rows
    if (!k) return { status: 'nokit' }
    if (!k.pin_hash) return { status: 'nopin', kitId: String(k.id) }
    if (pinLocked(k, new Date())) return { status: 'locked' }
    if (PIN_RE.test(pin) && checkPass(pin, k.pin_hash)) {
      await c.query(`update qr_codes set pin_fails=0,locked_until=null where id=$1`, [k.id])
      return { status: 'ok', kitId: String(k.id) }
    }
    const f = afterFail(k.pin_fails, new Date())
    await c.query(`update qr_codes set pin_fails=$2,locked_until=$3 where id=$1`, [k.id, f.pin_fails, f.locked_until])
    return { status: 'bad' }
  })
}

// Bloquea la fila del kit para que dos subidas simultáneas no superen el tope.
export async function savePhotos(kitId: string, photos: Buffer[], purposes: Purpose[], s: AvSettings): Promise<string[]> {
  return tx(async c => {
    await c.query(`select id from qr_codes where id=$1 for update`, [kitId])
    const { n } = (await c.query(`select count(*)::int n from media_files where qr_code_id=$1`, [kitId])).rows[0]
    if (n + photos.length > s.max_photos_per_kit) throw new Error('cupo')
    const ids: string[] = []
    for (const p of photos) {
      const e = encrypt(p)
      const [m] = (await c.query(`insert into media_files(qr_code_id,mime,bytes,iv,tag,data,delete_after)
        values($1,'image/webp',$2,$3,$4,$5,now()+make_interval(days=>$6)) returning id`, [kitId, p.length, e.iv, e.tag, e.data, s.retention_days])).rows
      for (const purpose of purposes)
        await c.query(`insert into consent_records(qr_code_id,media_file_id,purpose,version) values($1,$2,$3,$4)`, [kitId, m.id, purpose, s.consent_version])
      ids.push(m.id)
    }
    await c.query(`insert into adventure_events(adventure_id,qr_code_id,type) select adventure_id,id,'upload' from qr_codes where id=$1`, [kitId])
    return ids
  })
}

// kitId null = admin (puede ver todas para moderar).
export async function readPhoto(mediaId: string, kitId: string | null): Promise<Buffer | null> {
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) return null
  const [m] = await q<{ iv: Buffer; tag: Buffer; data: Buffer }>(`select iv,tag,data from media_files where id=$1 and ($2::bigint is null or qr_code_id=$2)`, [mediaId, kitId])
  return m ? decrypt(m) : null
}

export async function listPhotos(kitId: string) {
  return q<{ id: string; created_at: Date; consents: Purpose[] }>(`select m.id,m.created_at,
    coalesce(array_agg(c.purpose order by c.purpose) filter (where c.revoked_at is null), '{}') as consents
    from media_files m left join consent_records c on c.media_file_id=m.id where m.qr_code_id=$1 group by m.id order by m.created_at`, [kitId])
}

export async function deletePhoto(kitId: string, mediaId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) return false
  return (await q(`delete from media_files where id=$1 and qr_code_id=$2 returning id`, [mediaId, kitId])).length > 0
}

export async function deleteAll(kitId: string) {
  await tx(async c => {
    await c.query(`delete from media_files where qr_code_id=$1`, [kitId])
    await c.query(`delete from album_sessions where qr_code_id=$1`, [kitId])
    await c.query(`update qr_codes set pin_hash=null,pin_fails=0,locked_until=null where id=$1`, [kitId])
  })
}

export async function revokeConsent(kitId: string, mediaId: string, purpose: 'gallery' | 'ads') {
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) return false
  return tx(async c => {
    const r = await c.query(`update consent_records set revoked_at=now() where media_file_id=$1 and qr_code_id=$2 and purpose=$3 and revoked_at is null returning id`, [mediaId, kitId, purpose])
    if (purpose === 'gallery') await c.query(`update media_files set moderation='pending' where id=$1 and qr_code_id=$2 and moderation='approved'`, [mediaId, kitId])
    return (r.rowCount ?? 0) > 0
  })
}

export async function createAlbumToken(kitId: string) {
  const token = randomBytes(32).toString('hex')
  await q(`insert into album_sessions(token_hash,qr_code_id,expires_at) values($1,$2,now()+interval '30 minutes')`, [sha(token), kitId])
  return token
}
export async function kitForToken(token: string): Promise<{ id: string; code: string } | null> {
  const [k] = await q<{ id: string; code: string }>(`select k.id,k.code from album_sessions s join qr_codes k on k.id=s.qr_code_id
    where s.token_hash=$1 and s.expires_at>now()`, [sha(token)])
  return k ? { id: String(k.id), code: k.code } : null
}

// Cookie corta (30 min) solo para ver/borrar las fotos de ese kit.
export async function startAlbumSession(kitId: string) {
  ;(await cookies()).set('avs', await createAlbumToken(kitId), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 30 * 60 })
}
export async function albumKit() {
  const t = (await cookies()).get('avs')?.value
  return t ? kitForToken(t) : null
}

// Retención: el worker lo llama cada minuto.
export async function purgeExpired() {
  await q(`delete from media_files where delete_after < now()`)
  await q(`delete from album_sessions where expires_at < now()`)
}
