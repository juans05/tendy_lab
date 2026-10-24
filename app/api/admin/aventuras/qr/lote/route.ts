import { q } from '@/lib/db'
import { adminUser } from '@/lib/av-audit'
import { kitUrl, qrPng } from '@/lib/av-admin'
import { composeCard, loadTemplate, templateFor } from '@/lib/av-card'
import { zip } from '@/lib/zip'

// ZIP con la imagen de cada kit del lote (?batch=a&batch=b): tarjeta con su QR; si la aventura no tiene diseño, solo el QR.
export async function GET(req: Request) {
  if (!await adminUser()) return new Response(null, { status: 404 })
  const batches = [...new Set(new URL(req.url).searchParams.getAll('batch'))].slice(0, 20)
  const rows = await q<{ code: string; print_template: string | null; print_qr: any; collection_slug: string }>(
    `select k.code,a.print_template,a.print_qr,c.slug as collection_slug from qr_codes k join adventures a on a.id=k.adventure_id
     join collections c on c.id=a.collection_id where k.batch = any($1) order by k.id`, [batches])
  if (!rows.length) return new Response('Lote vacío o inexistente.', { status: 404 })
  const tpls = new Map<string, Promise<Buffer>>() // un diseño se descarga una vez por lote
  try {
    const files = []
    for (const r of rows) { // en serie: sharp con 10-100 tarjetas grandes en paralelo dispara la memoria
      const t = templateFor(r), url = kitUrl(r.code)
      if (t && !tpls.has(t.source)) tpls.set(t.source, loadTemplate(t.source))
      files.push(t ? { name: `tarjeta-${r.code}.png`, data: await composeCard(await tpls.get(t.source)!, url, r.print_qr) }
        : { name: `qr-${r.code}.png`, data: await qrPng(url) })
    }
    const name = batches.join('_').replace(/[^\w.-]+/g, '-') || 'lote'
    return new Response(new Uint8Array(zip(files)), { headers: {
      'Cache-Control': 'private, no-store', 'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="lote-${name}.zip"` } })
  } catch (e) {
    return new Response((e as Error).message, { status: 502 })
  }
}
