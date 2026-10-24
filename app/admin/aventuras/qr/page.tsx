import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { ResetPin } from '@/lib/av-reset-pin'
import { PROMOS } from '@/lib/av-card'

const ERR: Record<string, string> = { aventura: 'Elige una aventura.', lote: 'Pon un nombre de lote y una cantidad entre 1 y 1000.', nada: 'No se encontró ese código o lote.' }

export default async function Qr({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string; moved?: string }> }) {
  await requireAdmin()
  const { ok, e, moved } = await searchParams
  const advs = await q(`select id,slug,title from adventures order by id desc`)
  const batches = await q(`select k.batch,a.title,count(*)::int n,count(k.pin_hash)::int with_pin,min(k.created_at) as created
    from qr_codes k join adventures a on a.id=k.adventure_id group by k.batch,a.title order by created desc`)
  const options = advs.map(a => <option key={a.id} value={a.id}>{a.title}</option>)
  return <>
    {ok && <div className="ok">Lote «{ok}» generado. <a href={`/admin/aventuras/qr/imprimir?batch=${encodeURIComponent(ok)}`}>Imprimir</a></div>}
    {moved && <div className="ok">{moved} código(s) reasignados.</div>}
    {e && <div className="err">{ERR[e] ?? 'No se pudo completar.'}</div>}
    <form className="form" method="post" action="/api/admin/aventuras/qr">
      <h3>Generar lote de códigos de kit</h3>
      <p className="tag">Cada kit lleva un QR único. El código no se imprime como texto: va solo dentro del QR.</p>
      <input type="hidden" name="action" value="generate" />
      <div className="row">
        <div><label htmlFor="ga">Aventura</label><select id="ga" name="adventure_id">{options}</select></div>
        <div><label htmlFor="gb">Nombre del lote</label><input id="gb" name="batch" required maxLength={60} placeholder="Ej. halloween-oct-2026" /></div>
        <div><label htmlFor="gn">Cantidad</label><input id="gn" name="n" type="number" min={1} max={1000} defaultValue={50} required /></div>
      </div>
      <button>Generar</button>
    </form>
    <h2>Lotes</h2>
    <form method="get" action="/admin/aventuras/qr/imprimir">
    <p className="tag">Marca uno o varios lotes y pulsa «Imprimir seleccionados»: sus tarjetas salen intercaladas, 2 por hoja A4 (una de cada lote).</p>
    <div className="scroll"><table className="av-table"><thead><tr><th>Imprimir</th><th>Lote</th><th>Aventura</th><th>Códigos</th><th>Con fotos (PIN)</th><th></th></tr></thead><tbody>
      {batches.map(b => <tr key={b.batch + b.title}><td data-label="Imprimir"><input type="checkbox" name="batch" value={b.batch} aria-label={`Imprimir lote ${b.batch}`} style={{ width: 24, height: 24, margin: 0 }} /></td><td data-label="Lote"><b>{b.batch}</b></td><td data-label="Aventura">{b.title}</td><td data-label="Códigos">{b.n}</td><td data-label="Con fotos (PIN)">{b.with_pin}</td>
        <td data-label=""><a className="av-btnlink" href={`/admin/aventuras/qr/imprimir?batch=${encodeURIComponent(b.batch)}`}>Imprimir / descargar</a></td></tr>)}
    </tbody></table></div>
    <div style={{ position: 'sticky', bottom: 0, background: 'var(--cream)', padding: '8px 0', borderTop: '1px solid var(--line)' }}><button style={{ marginTop: 0 }}>🖨 Imprimir seleccionados</button></div>
    </form>
    <h2>QR general por aventura</h2>
    <p className="tag">Abre el cuento sin código de kit (para redes, tienda o empaque exterior). No permite subir fotos.</p>
    <p className="tag">Elige una imagen para descargarla con el QR y el WhatsApp ya puestos, o «Solo el QR».</p>
    <ul className="av-glist">{advs.map(a => <li key={a.id}><span>{a.title}</span><form method="get" action={`/api/admin/aventuras/qr/a-${a.slug}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select name="img" aria-label={`Imagen para ${a.title}`} style={{ margin: 0 }}><option value="">Solo el QR (PNG)</option>{Object.entries(PROMOS).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}</select>
      <button style={{ marginTop: 0 }}>Descargar</button><a className="av-btnlink" href={`/api/admin/aventuras/qr/a-${a.slug}?format=svg`}>SVG</a></form></li>)}</ul>
    <form className="form" method="post" action="/api/admin/aventuras/qr">
      <h3>Reasignar a otra aventura</h3>
      <p className="tag">Los QR impresos no cambian: solo cambia la historia que abren.</p>
      <input type="hidden" name="action" value="reassign" />
      <div className="row">
        <div><label htmlFor="rb">Lote</label><input id="rb" name="batch" placeholder="nombre del lote" /></div>
        <div><label htmlFor="rc">…o un código</label><input id="rc" name="code" placeholder="TP-XXXXXXXX" /></div>
        <div><label htmlFor="ra">Nueva aventura</label><select id="ra" name="adventure_id">{options}</select></div>
      </div>
      <button>Reasignar</button>
    </form>
    <ResetPin />
  </>
}
