import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'

const LABEL: Record<string, string> = { store: 'Guardar', gallery: 'Galería', ads: 'Publicidad' }
const STATE: Record<string, string> = { pending: 'Por revisar', approved: 'Aprobada para galería', rejected: 'Rechazada' }

export default async function Fotos({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string; page?: string }> }) {
  await requireAdmin()
  const { ok, e, page } = await searchParams
  const p = Math.max(0, Number(page) || 0)
  const rows = await q(`select m.id,m.moderation,m.created_at,k.batch,a.title,
      coalesce(array_agg(c.purpose order by c.purpose) filter (where c.revoked_at is null), '{}') as consents
    from media_files m join qr_codes k on k.id=m.qr_code_id join adventures a on a.id=k.adventure_id
    left join consent_records c on c.media_file_id=m.id group by m.id,k.batch,a.title
    order by (m.moderation='pending') desc, m.created_at desc limit 50 offset $1`, [p * 50])
  const btn = (id: string, action: string, label: string) => <form method="post" action="/api/admin/aventuras/fotos" style={{ display: 'inline' }}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="action" value={action} /><button className={action === 'approved' ? '' : 'btn ghost'}>{label}</button></form>
  return <>
    {ok && <div className="ok">Listo.</div>}
    {e && <div className="err">{e === 'permiso' ? 'No se puede aprobar: el adulto no dio (o retiró) el permiso de galería.' : 'No se pudo completar.'}</div>}
    <p className="tag">Las fotos son privadas: solo se ven aquí (admin) o con el QR del kit y su PIN. Aprobar solo si se ve la figura, sin rostros ni datos del niño.</p>
    {!rows.length && <p className="tag">No hay fotos recibidas.</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
      {rows.map(r => <div className="av-card" key={r.id}>
        <img src={`/api/aventuras/fotos/${r.id}`} alt="Foto recibida" loading="lazy" style={{ width: '100%', borderRadius: 10 }} />
        <p className="av-small">{r.title} · lote {r.batch} · {new Date(r.created_at).toLocaleDateString('es-PE')}</p>
        <p className="av-small">Permisos: {r.consents.map((c: string) => LABEL[c]).join(', ')}</p>
        <p><span className={`av-badge${r.moderation === 'approved' ? ' on' : ''}`}>{STATE[r.moderation]}</span></p>
        <div className="av-row">{r.consents.includes('gallery') && r.moderation !== 'approved' && btn(r.id, 'approved', 'Aprobar')}
          {r.moderation !== 'rejected' && btn(r.id, 'rejected', 'Rechazar')}{btn(r.id, 'delete', 'Borrar')}</div>
      </div>)}
    </div>
    <p>{p > 0 && <a className="av-btnlink" href={`?page=${p - 1}`}>← Anteriores</a>} {rows.length === 50 && <a className="av-btnlink" href={`?page=${p + 1}`}>Siguientes →</a>}</p>
  </>
}
