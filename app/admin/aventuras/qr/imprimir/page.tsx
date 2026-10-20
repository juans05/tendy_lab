import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { kitUrl, qrSvg } from '@/lib/av-admin'
import { templateFor } from '@/lib/av-card'

// Hoja para imprimir (el navegador la guarda como PDF). Sin el código en texto: solo el QR.
// Si la aventura del kit tiene diseño de tarjeta, sale una tarjeta por página con el QR en su recuadro.
export default async function Imprimir({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  await requireAdmin()
  const batch = (await searchParams).batch ?? ''
  const codes = await q<{ code: string; title: string; print_template: string | null; print_qr: { x: number; y: number; size: number }; collection_slug: string }>(
    `select k.code,a.title,a.print_template,a.print_qr,c.slug as collection_slug from qr_codes k join adventures a on a.id=k.adventure_id
     join collections c on c.id=a.collection_id where k.batch=$1 order by k.id`, [batch])
  const svgs = await Promise.all(codes.map(c => qrSvg(kitUrl(c.code))))
  const src = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`
  const tpl = codes.map(c => templateFor(c))
  const cards = tpl.some(Boolean)
  return <>
    <style>{`@media print { body * { visibility: hidden } .qr-sheet, .qr-sheet * { visibility: visible } .qr-sheet { position: absolute; inset: 0 } .no-print { display: none }
        .qr-sheet.cards { display: block } .qr-card { break-after: page; box-shadow: none !important } @page { margin: 0 } }
      .qr-sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(4cm, 1fr)); gap: .6cm; } .qr-sheet figure { margin: 0; break-inside: avoid; text-align: center; }
      .qr-sheet figure img { width: 4cm; height: 4cm; } .qr-sheet figcaption { font-size: 9px; color: #555; }
      .qr-sheet.cards { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
      .qr-card { position: relative; box-shadow: 0 4px 18px #0002; border-radius: 6px; overflow: hidden; }
      .qr-card > img { display: block; width: 100%; } .qr-card .qr { position: absolute; height: auto; background: #fff; }`}</style>
    <div className="no-print">
      <h2>Lote «{batch}» · {codes.length} kits</h2>
      <p className="tag">Usa Imprimir del navegador (Ctrl+P) y elige «Guardar como PDF».{cards ? ' Sale una tarjeta por página.' : ' Sube el diseño de la tarjeta en el editor de la aventura para imprimir tarjetas completas.'} Recomendado: dentro del empaque.</p>
      <details><summary>Descargar uno por uno</summary><ul className="av-glist">{codes.map(c => <li key={c.code}><span>{c.code}</span><span>
        {tpl[codes.indexOf(c)] && <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=card`}>Tarjeta PNG</a>}
        <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}`}>QR PNG</a><a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=svg`}>QR SVG</a></span></li>)}</ul></details>
    </div>
    <div className={`qr-sheet${cards ? ' cards' : ''}`}>{codes.map((c, i) => tpl[i]
      ? <div className="qr-card" key={c.code}>
          <img src={tpl[i]!.url} alt={`Tarjeta ${c.title}`} />
          <img className="qr" src={src(svgs[i])} alt={`QR del kit ${i + 1}`} style={{ left: `${c.print_qr.x}%`, top: `${c.print_qr.y}%`, width: `${c.print_qr.size}%` }} />
        </div>
      : <figure key={c.code}><img src={src(svgs[i])} alt={`QR del kit ${i + 1}`} /><figcaption>Escanéame · Tendy Aventuras</figcaption></figure>)}</div>
  </>
}
