import { q } from '@/lib/db'

const TYPES = ['scan', 'start', 'complete', 'diploma', 'upload', 'whatsapp'] as const
const LABEL: Record<string, string> = { scan: 'Escaneos', start: 'Iniciadas', complete: 'Completadas', diploma: 'Diplomas', upload: 'Fotos', whatsapp: 'WhatsApp' }
const cols = TYPES.map(t => `count(*) filter (where e.type='${t}')::int as ${t}`).join(',')

// Últimos 30 días, por aventura y por lote de QR.
export default async function Resumen() {
  const byAdv = await q(`select a.title,${cols} from adventures a left join adventure_events e on e.adventure_id=a.id and e.created_at>now()-interval '30 days' group by a.id order by a.id`)
  const byBatch = await q(`select k.batch,${cols} from adventure_events e join qr_codes k on k.id=e.qr_code_id where e.created_at>now()-interval '30 days' group by k.batch order by k.batch`)
  const [{ pending }] = await q(`select count(*)::int pending from media_files where moderation='pending'`)
  const table = (rows: any[], key: string, head: string) => <div className="scroll"><table><thead><tr><th>{head}</th>{TYPES.map(t => <th key={t}>{LABEL[t]}</th>)}</tr></thead>
    <tbody>{rows.map(r => <tr key={r[key]}><td>{r[key]}</td>{TYPES.map(t => <td key={t}>{r[t]}</td>)}</tr>)}</tbody></table></div>
  return <>
    <p className="tag">Últimos 30 días. Fotos por revisar: <b>{pending}</b> · <a href="/admin/aventuras/fotos">revisar</a></p>
    <h2>Por aventura</h2>{table(byAdv, 'title', 'Aventura')}
    <h2>Por lote de QR</h2>{byBatch.length ? table(byBatch, 'batch', 'Lote') : <p className="tag">Aún no hay escaneos de kits.</p>}
  </>
}
