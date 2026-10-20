import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { kitUrl, qrSvg } from '@/lib/av-admin'
import { templateFor } from '@/lib/av-card'

// Hoja para imprimir (el navegador la guarda como PDF). Sin el código en texto: solo el QR.
// Si la aventura del kit tiene diseño de tarjeta, salen tarjetas con el QR en su recuadro: 1, 2 o 4 por hoja.
// La tarjeta tiene proporción A5: 1 = hoja A5, 2 = A4 horizontal (dos A5), 4 = A4 vertical (cuatro A6).
const LAYOUT = { 1: { page: 'A5 portrait', w: 148, h: 210 }, 2: { page: 'A4 landscape', w: 148.5, h: 210 }, 4: { page: 'A4 portrait', w: 105, h: 148.5 } } as const
export default async function Imprimir({ searchParams }: { searchParams: Promise<{ batch?: string; por?: string }> }) {
  await requireAdmin()
  const sp = await searchParams
  const batch = sp.batch ?? ''
  const por = (({ '2': 2, '4': 4 } as const)[sp.por ?? ''] ?? 1) as keyof typeof LAYOUT
  const L = LAYOUT[por]
  const codes = await q<{ code: string; title: string; print_template: string | null; print_qr: { x: number; y: number; size: number }; collection_slug: string }>(
    `select k.code,a.title,a.print_template,a.print_qr,c.slug as collection_slug from qr_codes k join adventures a on a.id=k.adventure_id
     join collections c on c.id=a.collection_id where k.batch=$1 order by k.id`, [batch])
  const svgs = await Promise.all(codes.map(c => qrSvg(kitUrl(c.code))))
  const src = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`
  const tpl = codes.map(c => templateFor(c))
  const cards = tpl.some(Boolean)
  const pages = Array.from({ length: Math.ceil(codes.length / por) }, (_, p) => codes.slice(p * por, p * por + por).map((c, j) => ({ c, i: p * por + j })))
  const qrImg = (i: number) => <img src={src(svgs[i])} alt={`QR del kit ${i + 1}`} />
  return <>
    <style>{`@page { size: ${L.page}; margin: 0 }
      @media print { main.page > :not(.qr-sheet) { display: none !important } main.page { padding: 0 !important; margin: 0 !important; max-width: none !important }
        .qr-sheet.cards { display: block } .qr-page { gap: 0 !important; break-after: page; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; background: none !important; width: max-content } .qr-page:last-child { break-after: auto }
        .qr-page .qr-card { width: ${L.w}mm !important; height: ${L.h}mm; border-radius: 0; box-shadow: none !important } .qr-card > img:first-child { height: 100%; object-fit: fill } }
      .qr-sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(4cm, 1fr)); gap: .6cm; } .qr-sheet figure { margin: 0; break-inside: avoid; text-align: center; }
      .qr-sheet figure img { width: 4cm; height: 4cm; } .qr-sheet figcaption { font-size: 9px; color: #555; }
      .qr-sheet.cards { display: flex; flex-wrap: wrap; gap: 20px; }
      .qr-page { display: grid; grid-template-columns: repeat(${por === 1 ? 1 : 2}, auto); gap: 4px; padding: 6px; background: #fff; border: 1px dashed var(--line); border-radius: 8px; }
      .qr-card { position: relative; width: ${por === 4 ? 150 : 220}px; box-shadow: 0 4px 18px #0002; border-radius: 6px; overflow: hidden; }
      .qr-card > img:first-child { display: block; width: 100%; } .qr-card .qr { position: absolute; height: auto; background: #fff; }
      .qr-card figure img { width: 100%; height: auto; } .av-btnlink.on { background: var(--orange); border-color: var(--orange); color: var(--ink); }`}</style>
    <div className="no-print">
      <h2>Lote «{batch}» · {codes.length} kits</h2>
      {cards && <p className="av-row"><b>Tarjetas por hoja:</b>{([1, 2, 4] as const).map(n =>
        <a key={n} className={`av-btnlink${n === por ? ' on' : ''}`} href={`?batch=${encodeURIComponent(batch)}&por=${n}`}>{n} {n === 1 ? '(A5)' : n === 2 ? '(A4 horizontal)' : '(A4, tamaño A6)'}</a>)}</p>}
      <p className="tag">Usa Imprimir del navegador (Ctrl+P) y elige «Guardar como PDF». Deja la escala en 100 % y los márgenes en «Ninguno».{cards ? '' : ' Sube el diseño de la tarjeta en el editor de la aventura para imprimir tarjetas completas.'} Recomendado: dentro del empaque.</p>
      <details><summary>Descargar uno por uno</summary><ul className="av-glist">{codes.map((c, i) => <li key={c.code}><span>{c.code}</span><span>
        {tpl[i] && <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=card`}>Tarjeta PNG</a>}
        <a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}`}>QR PNG</a><a className="av-btnlink" href={`/api/admin/aventuras/qr/${c.code}?format=svg`}>QR SVG</a></span></li>)}</ul></details>
    </div>
    {cards ? <div className="qr-sheet cards">{pages.map((pg, p) => <div className="qr-page" key={p}>{pg.map(({ c, i }) => <div className="qr-card" key={c.code}>
        {tpl[i] ? <><img src={tpl[i]!.url} alt={`Tarjeta ${c.title}`} />
          <img className="qr" src={src(svgs[i])} alt={`QR del kit ${i + 1}`} style={{ left: `${c.print_qr.x}%`, top: `${c.print_qr.y}%`, width: `${c.print_qr.size}%` }} /></>
          : <figure>{qrImg(i)}</figure>}
      </div>)}</div>)}</div>
      : <div className="qr-sheet">{codes.map((c, i) => <figure key={c.code}>{qrImg(i)}<figcaption>Escanéame · Tendy Aventuras</figcaption></figure>)}</div>}
  </>
}
