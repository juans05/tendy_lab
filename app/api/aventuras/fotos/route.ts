import { q } from '@/lib/db'
import { normalizeCode } from '@/lib/av-codes'
import { mediaKey } from '@/lib/av-crypto'
import { sanitizeImage } from '@/lib/av-image'
import { getSettings } from '@/lib/av-settings'
import { PIN_RE, savePhotos, setPin, startAlbumSession, verifyPin, type Purpose } from '@/lib/av-album'
import { loginGuard } from '@/lib/login-guard'

// Subida del adulto: código de kit válido + permiso "guardar" + PIN. Nunca anónima ni ilimitada.
const g = globalThis as any
const perIp: ReturnType<typeof loginGuard> = (g.__avUploads ??= loginGuard(10, 3600_000))
const fail = (status: number, error: string) => Response.json({ error }, { status })

export async function POST(req: Request) {
  if (!mediaKey()) return fail(503, 'Por ahora no podemos guardar fotos. Inténtalo más tarde.')
  const s = await getSettings()
  if (!s.uploads_enabled) return fail(403, 'La subida de fotos está pausada por el momento.')
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',').pop()!.trim()
  if (perIp.blocked(ip)) return fail(429, 'Demasiados intentos. Vuelve a intentarlo en una hora.')
  perIp.fail(ip) // se cuenta antes de cualquier await pesado
  const f = await req.formData().catch(() => null)
  if (!f) return fail(400, 'No recibimos las fotos. Inténtalo de nuevo.')
  const code = normalizeCode(String(f.get('k') ?? ''))
  const [kit] = code ? await q<{ id: string; has_pin: boolean }>(`select id,pin_hash is not null as has_pin from qr_codes where code=$1`, [code]) : []
  if (!kit) return fail(404, 'Escanea el QR de tu kit para guardar fotos.')
  if (f.get('store') !== 'on') return fail(400, 'Para guardar la foto necesitamos tu autorización.')
  const pin = String(f.get('pin') ?? '')
  if (!PIN_RE.test(pin)) return fail(400, 'El PIN debe tener 4 números.')
  const files = f.getAll('files').filter((x): x is File => x instanceof File && x.size > 0)
  if (!files.length || files.length > s.max_photos_per_kit) return fail(400, `Elige de 1 a ${s.max_photos_per_kit} fotos.`)
  if (kit.has_pin) {
    const v = await verifyPin(code!, pin)
    if (v.status === 'locked') return fail(423, 'Demasiados intentos con el PIN. Espera 15 minutos o escríbenos por WhatsApp.')
    if (v.status !== 'ok') return fail(401, 'El PIN no es correcto.')
  }
  let photos: Buffer[]
  try { photos = await Promise.all(files.map(async x => sanitizeImage(Buffer.from(await x.arrayBuffer()), s.max_photo_mb * 1024 * 1024))) }
  catch (e: any) { return fail(400, e.message === 'tamaño' ? `Cada foto puede pesar hasta ${s.max_photo_mb} MB.` : 'Solo aceptamos fotos JPG, PNG o WebP.') }
  if (!kit.has_pin && !(await setPin(kit.id, pin)) && (await verifyPin(code!, pin)).status !== 'ok') return fail(401, 'El PIN no es correcto.')
  const purposes: Purpose[] = ['store', ...(f.get('gallery') === 'on' ? ['gallery' as const] : []), ...(f.get('ads') === 'on' ? ['ads' as const] : [])]
  try { await savePhotos(kit.id, photos, purposes, s) }
  catch (e: any) { if (e.message === 'cupo') return fail(409, `Este kit ya tiene el máximo de ${s.max_photos_per_kit} fotos. Borra alguna en «Ver mis fotos».`); throw e }
  await startAlbumSession(kit.id)
  return Response.json({ ok: true })
}
