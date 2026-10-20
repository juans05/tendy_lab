import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { kitUrl, qrSvg } from '@/lib/av-admin'
import { interleave, templateFor } from '@/lib/av-card'
import { PrintSheet } from '@/lib/av-print-sheet'

// Hoja para imprimir un lote: se eligen las tarjetas y salen de 2 en 2 por A4 (o 1 / 4). Sin el código en texto: solo el QR.
// Cada kit usa el diseño de su aventura (o de su colección); sin diseño, solo el QR.
export default async function Imprimir({ searchParams }: { searchParams: Promise<{ batch?: string | string[] }> }) {
  await requireAdmin()
  // Uno o varios lotes (?batch=a&batch=b): sus tarjetas se intercalan para que cada A4 lleve una de cada lote.
  const batches = [...new Set([(await searchParams).batch ?? []].flat())].slice(0, 20)
  const rows = await q<{ code: string; batch: string; title: string; print_template: string | null; print_qr: { x: number; y: number; size: number }; collection_slug: string }>(
    `select k.code,k.batch,a.title,a.print_template,a.print_qr,c.slug as collection_slug from qr_codes k join adventures a on a.id=k.adventure_id
     join collections c on c.id=a.collection_id where k.batch = any($1) order by k.id`, [batches])
  const codes = interleave(batches.map(b => rows.filter(r => r.batch === b)))
  const cards = await Promise.all(codes.map(async c => ({
    code: c.code, batch: c.batch, title: c.title, tpl: templateFor(c)?.url ?? null, pos: c.print_qr,
    qr: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await qrSvg(kitUrl(c.code)))}`,
  })))
  return <>
    <div className="no-print">
      <h2>{batches.length > 1 ? `Lotes ${batches.map(b => `«${b}»`).join(', ')}` : `Lote «${batches[0] ?? ''}»`} · {codes.length} kits</h2>
      {!batches.length && <p className="err">Elige al menos un lote en Códigos QR.</p>}
      <p className="tag">Marca las tarjetas que quieres y pulsa «Descargar PDF / Imprimir»: salen 2 por hoja A4. En la ventana de impresión elige «Guardar como PDF», escala 100 % y márgenes «Ninguno». Recomendado: dentro del empaque.</p>
      <details><summary>Descargar uno por uno</summary><ul className="av-glist">{cards.map(c => <li key={c.code}><span>{c.code}</span><span>
        {c.tpl && <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=card`}>Tarjeta PNG</a>}
        <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}`}>QR PNG</a><a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=svg`}>QR SVG</a></span></li>)}</ul></details>
    </div>
    <PrintSheet cards={cards} />
  </>
}
