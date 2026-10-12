import { requireUser } from '@/lib/auth'
import { q } from '@/lib/db'
import { fmt } from '@/lib/credits'
import { TOOLS } from '@/lib/meta'

const STATUS: Record<string, string> = { QUEUED: 'En cola', RUNNING: 'Procesando', COMPLETED: 'Listo', FAILED: 'Falló' }

export default async function History({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const user = await requireUser()
  const { tool } = await searchParams
  const rows = await q(
    `select id,tool,status,cost,created_at,result->>'overall' as score from runs
     where user_id=$1 and ($2::text is null or tool=$2) order by id desc limit 100`, [user.id, tool && tool in TOOLS ? tool : null])
  return (
    <>
      <span className="eyebrow">TUS IDEAS, CON PERSPECTIVA</span>
      <h1>Mis análisis</h1>
      <p className="muted">Vuelve a tus resultados y retoma tu siguiente mejora.</p>
      <nav className="history-filters" aria-label="Filtrar análisis">
        <a href="/panel/history" aria-current={!tool ? 'page' : undefined}>Todos</a>{Object.entries(TOOLS).map(([k, v]) => <a key={k} href={`/panel/history?tool=${k}`} aria-current={tool === k ? 'page' : undefined}>{v.title}</a>)}
      </nav>
      {rows.length === 0 ? <div className="card empty-history"><span aria-hidden="true">◷</span><h2>{tool ? 'Aún no hay análisis de esta herramienta' : 'Aquí empieza tu recorrido'}</h2><p>Cuando completes un análisis, encontrarás aquí sus resultados.</p><a className="btn" href="/panel">Explorar herramientas ↗</a></div> : (
        <div className="scroll"><table><thead><tr><th>#</th><th>Herramienta</th><th>Fecha</th><th>Score</th><th>Monedas</th><th>Estado</th></tr></thead><tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><a href={`/panel/runs/${r.id}`}>{r.id}</a></td><td>{TOOLS[r.tool as keyof typeof TOOLS]?.title}</td>
              <td>{new Date(r.created_at).toLocaleString('es-PE')}</td><td>{r.score ?? '—'}</td>
              <td>{r.cost ? fmt(r.cost) : 'Gratis'}</td><td>{STATUS[r.status]}</td>
            </tr>
          ))}
        </tbody></table></div>
      )}
    </>
  )
}
