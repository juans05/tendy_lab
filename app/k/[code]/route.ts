import { q } from '@/lib/db'
import { normalizeCode } from '@/lib/av-codes'

export const dynamic = 'force-dynamic'

// Destino del QR de cada kit: el código decide la aventura (se puede reasignar sin reimprimir) y cuenta el escaneo.
export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normalizeCode(decodeURIComponent((await params).code))
  const [kit] = code ? await q<{ id: string; adventure_id: string; slug: string }>(
    `select k.id,k.adventure_id,a.slug from qr_codes k join adventures a on a.id=k.adventure_id where k.code=$1`, [code]) : []
  if (!kit) return new Response('Código no encontrado', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })
  await q(`insert into adventure_events(adventure_id,qr_code_id,type) values($1,$2,'scan')`, [kit.adventure_id, kit.id])
  return new Response(null, { status: 302, headers: { Location: `/aventuras/${kit.slug}?k=${code}`, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}
