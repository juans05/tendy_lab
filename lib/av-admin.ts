import QRCode from 'qrcode'
import { q, tx } from './db'
import { hashPass } from './auth'
import { newCode } from './av-codes'
import { tempPin } from './av-pin'

// Lotes de códigos de kit. La unicidad la garantiza la BD: si un código choca, se reintenta.
export async function generateBatch(adventureId: string, batch: string, n: number): Promise<string[]> {
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('El lote debe tener entre 1 y 1000 códigos.')
  const codes: string[] = []
  while (codes.length < n) {
    const r = await q<{ code: string }>(`insert into qr_codes(code,adventure_id,batch) values($1,$2,$3) on conflict (code) do nothing returning code`, [newCode(), adventureId, batch])
    if (r.length) codes.push(r[0].code)
  }
  return codes
}

// Cambiar la aventura de un código o lote sin reimprimir los QR.
export async function reassign(target: { batch?: string; code?: string }, adventureId: string) {
  const r = target.code ? await q(`update qr_codes set adventure_id=$2 where code=$1 returning id`, [target.code, adventureId])
    : await q(`update qr_codes set adventure_id=$2 where batch=$1 returning id`, [target.batch, adventureId])
  return r.length
}

// PIN temporal: se muestra una sola vez al admin (para enviarlo por WhatsApp) y solo se guarda su hash.
// También cierra las sesiones abiertas del kit: quien entró con el PIN anterior deja de ver las fotos.
export async function resetPin(code: string): Promise<string | null> {
  const pin = tempPin()
  return tx(async c => {
    const r = await c.query(`update qr_codes set pin_hash=$2,pin_fails=0,locked_until=null where code=$1 returning id`, [code, hashPass(pin)])
    if (!r.rowCount) return null
    await c.query(`delete from album_sessions where qr_code_id=$1`, [r.rows[0].id])
    return pin
  })
}

// Aprobar para la galería exige el permiso "gallery" vigente de esa foto.
export async function moderate(mediaId: string, decision: 'approved' | 'rejected') {
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) return false
  const r = await q(`update media_files m set moderation=$2 where id=$1 and ($2='rejected' or exists(
    select 1 from consent_records c where c.media_file_id=m.id and c.purpose='gallery' and c.revoked_at is null)) returning id`, [mediaId, decision])
  return r.length > 0
}

export const kitUrl = (code: string) => `${process.env.PUBLIC_BASE_URL || 'https://tendyperu.com'}/k/${code}`
export const adventureUrl = (slug: string) => `${process.env.PUBLIC_BASE_URL || 'https://tendyperu.com'}/aventuras/${slug}`
export const qrPng = (url: string) => QRCode.toBuffer(url, { width: 1024, margin: 2, errorCorrectionLevel: 'M' })
export const qrSvg = (url: string) => QRCode.toString(url, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' })
