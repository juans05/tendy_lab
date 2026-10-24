import { q } from '@/lib/db'
import { normalizeCode } from '@/lib/av-codes'
import { adminUser } from '@/lib/av-audit'
import { adventureUrl, kitUrl, qrPng, qrSvg } from '@/lib/av-admin'
import { readFile } from 'node:fs/promises'
import { composeCard, promoFile, PROMOS, templateFor } from '@/lib/av-card'

// QR de un kit (/k/CODE) o general de una aventura (a-<slug>), en PNG o SVG.
// format=card: la tarjeta para imprimir (plantilla de la aventura con el QR en su recuadro), en PNG.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!await adminUser()) return new Response(null, { status: 404 })
  const raw = (await params).code
  const format = new URL(req.url).searchParams.get('format')
  let url: string, name: string, card: { print_template: string | null; print_qr: any; collection_slug: string } | undefined
  if (raw.startsWith('a-')) {
    const slug = raw.slice(2)
    if (!/^[a-z0-9-]+$/.test(slug)) return new Response(null, { status: 404 })
    ;[card] = await q(`select a.print_template,a.print_qr,c.slug as collection_slug from adventures a join collections c on c.id=a.collection_id where a.slug=$1`, [slug])
    if (!card) return new Response(null, { status: 404 })
    url = adventureUrl(slug); name = `qr-${slug}`
  } else {
    const code = normalizeCode(raw)
    ;[card] = code ? await q(`select a.print_template,a.print_qr,c.slug as collection_slug from qr_codes k join adventures a on a.id=k.adventure_id join collections c on c.id=a.collection_id where k.code=$1`, [code]) : []
    if (!card) return new Response(null, { status: 404 })
    url = kitUrl(code!); name = `qr-${code}`
  }
  const headers = { 'Cache-Control': 'private, no-store' }
  const file = (ext: string) => ({ 'Content-Disposition': `attachment; filename="${name}.${ext}"` })
  const img = new URL(req.url).searchParams.get('img') ?? ''
  if (Object.hasOwn(PROMOS, img)) {
    const png = await composeCard(await readFile(promoFile(img)), url, PROMOS[img].qr)
    return new Response(new Uint8Array(png), { headers: { ...headers, 'Content-Disposition': `attachment; filename="${img}-${name.slice(3)}.png"`, 'Content-Type': 'image/png' } })
  }
  if (format === 'card') {
    const t = templateFor(card)
    if (!t) return new Response('Esta aventura no tiene diseño de tarjeta.', { status: 404 })
    const res = t.source.startsWith('http') ? await fetch(t.source) : null
    if (res && !res.ok) return new Response('No se pudo leer el diseño de la tarjeta.', { status: 502 })
    const png = await composeCard(res ? Buffer.from(await res.arrayBuffer()) : await readFile(t.source), url, card.print_qr)
    return new Response(new Uint8Array(png), { headers: { ...headers, 'Content-Disposition': `attachment; filename="tarjeta-${name.slice(3)}.png"`, 'Content-Type': 'image/png' } })
  }
  return format === 'svg' ? new Response(await qrSvg(url), { headers: { ...headers, ...file('svg'), 'Content-Type': 'image/svg+xml' } })
    : new Response(new Uint8Array(await qrPng(url)), { headers: { ...headers, ...file('png'), 'Content-Type': 'image/png' } })
}
