import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'
import { fmt } from '@/lib/credits'

export const dynamic = 'force-dynamic'

export default async function Admin({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requireAdmin()
  const { ok, e } = await searchParams
  const users = await q(
    `select u.id,u.email,u.created_at,coalesce(sum(l.amount),0)::int as bal,
       (select count(*) from runs r where r.user_id=u.id)::int as runs
     from users u left join ledger l on l.user_id=u.id group by u.id order by u.id desc limit 200`)
  const stats = (await q(`select count(*) filter (where status='FAILED')::int failed, count(*)::int total from runs`))[0]
  return (
    <main className="wrap page">
      <p><a href="/panel">Volver al panel</a></p>
      <h1>Admin</h1>
      <p className="tag">Análisis totales: {stats.total} · fallidos: {stats.failed}</p>
      {ok && <div className="ok">Monedas aplicadas.</div>}
      {e && <div className="err">No se pudo aplicar (revisa email y cantidad).</div>}
      <form className="form" method="post" action="/api/admin/grant">
        <h3>Asignar monedas (negativo para descontar)</h3>
        <div className="row">
          <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
          <div><label htmlFor="credits">Monedas</label><input id="credits" name="credits" type="number" step="0.5" required /></div>
          <div><label htmlFor="note">Motivo</label><input id="note" name="note" /></div>
        </div>
        <button>Aplicar</button>
      </form>
      <div className="scroll"><table><thead><tr><th>Email</th><th>Alta</th><th>Saldo</th><th>Análisis</th></tr></thead><tbody>
        {users.map(u => <tr key={u.id}><td>{u.email}</td><td>{new Date(u.created_at).toLocaleDateString('es-PE')}</td><td>{fmt(u.bal)}</td><td>{u.runs}</td></tr>)}
      </tbody></table></div>
    </main>
  )
}
