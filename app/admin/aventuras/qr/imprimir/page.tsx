import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { kitUrl, qrSvg } from '@/lib/av-admin'

// Hoja para imprimir (el navegador la guarda como PDF). Sin el código en texto: solo el QR.
export default async function Imprimir({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  await requireAdmin()
  const batch = (await searchParams).batch ?? ''
  const codes = await q<{ code: string; title: string }>(`select k.code,a.title from qr_codes k join adventures a on a.id=k.adventure_id where k.batch=$1 order by k.id`, [batch])
  const svgs = await Promise.all(codes.map(c => qrSvg(kitUrl(c.code))))
  return <>
    <style>{`@media print { body * { visibility: hidden } .qr-sheet, .qr-sheet * { visibility: visible } .qr-sheet { position: absolute; inset: 0 } .no-print { display: none } }
      .qr-sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(4cm, 1fr)); gap: .6cm; } .qr-sheet figure { margin: 0; break-inside: avoid; text-align: center; }
      .qr-sheet img { width: 4cm; height: 4cm; } .qr-sheet figcaption { font-size: 9px; color: #555; }`}</style>
    <div className="no-print">
      <h2>Lote «{batch}» · {codes.length} códigos</h2>
      <p className="tag">Usa Imprimir del navegador (Ctrl+P) y elige «Guardar como PDF». Recomendado: QR dentro del empaque.</p>
      <details><summary>Descargar uno por uno (PNG / SVG)</summary><ul>{codes.map(c => <li key={c.code}>{c.code}: <a href={`/api/admin/aventuras/qr/${c.code}`}>PNG</a> · <a href={`/api/admin/aventuras/qr/${c.code}?format=svg`}>SVG</a></li>)}</ul></details>
    </div>
    <div className="qr-sheet">{svgs.map((s, i) => <figure key={codes[i].code}><img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`} alt={`QR del kit ${i + 1}`} /><figcaption>Escanéame · Tendy Aventuras</figcaption></figure>)}</div>
  </>
}
