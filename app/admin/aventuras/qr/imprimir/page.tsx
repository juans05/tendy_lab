import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { kitUrl, qrSvg } from '@/lib/av-admin'
import { templateFor } from '@/lib/av-card'
import { PrintSheet } from '@/lib/av-print-sheet'

// Hoja para imprimir un lote: se eligen las tarjetas y salen de 2 en 2 por A4 (o 1 / 4). Sin el código en texto: solo el QR.
// Cada kit usa el diseño de su aventura (o de su colección); sin diseño, solo el QR.
export default async function Imprimir({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  await requireAdmin()
  const batch = (await searchParams).batch ?? ''
  const codes = await q<{ code: string; title: string; print_template: string | null; print_qr: { x: number; y: number; size: number }; collection_slug: string }>(
    `select k.code,a.title,a.print_template,a.print_qr,c.slug as collection_slug from qr_codes k join adventures a on a.id=k.adventure_id
     join collections c on c.id=a.collection_id where k.batch=$1 order by k.id`, [batch])
  const cards = await Promise.all(codes.map(async c => ({
    code: c.code, title: c.title, tpl: templateFor(c)?.url ?? null, pos: c.print_qr,
    qr: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await qrSvg(kitUrl(c.code)))}`,
  })))
  return <>
    <div className="no-print">
      <h2>Lote «{batch}» · {codes.length} kits</h2>
      <p className="tag">Marca las tarjetas que quieres y pulsa «Descargar PDF / Imprimir»: salen 2 por hoja A4. En la ventana de impresión elige «Guardar como PDF», escala 100 % y márgenes «Ninguno». Recomendado: dentro del empaque.</p>
      <details><summary>Descargar uno por uno</summary><ul className="av-glist">{cards.map(c => <li key={c.code}><span>{c.code}</span><span>
        {c.tpl && <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=card`}>Tarjeta PNG</a>}
        <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}`}>QR PNG</a><a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=svg`}>QR SVG</a></span></li>)}</ul></details>
    </div>
    <PrintSheet cards={cards} />
  </>
}
