import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { q } from '@/lib/db'
import { coins } from '@/lib/credits'
import { LABEL } from '@/lib/scoring'
import { money, TOOLS } from '@/lib/meta'
import { CopyText } from '@/lib/copy-text'
import { RunProgress } from '@/lib/run-progress'
import { TranscriptResult } from '@/lib/transcript-result'
import { ScriptResult } from '@/lib/script-result'

const sev = (s: string) => (s === 'Crítico' ? 'c' : s === 'Importante' ? 'i' : 'o')

function Score({ r }: { r: any }) {
  return (
    <>
      <div className="card result-head">
        <div className="ring" style={{ ['--v' as any]: r.overall }} data-n={r.overall} role="img" aria-label={`Puntaje ${r.overall} de 100`} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="band">Potencial {r.band.toLowerCase()}</div>
          <p style={{ margin: '4px 0' }}>{r.summary}</p>
          <span className="tag">{r.disclaimer}</span>
        </div>
      </div>
      <h2>Puntaje por dimensión</h2>
      <div className="card">
        {r.dimensions.map((d: any) => (
          <div className="dim" key={d.name}>
            <div className="l"><span>{LABEL[d.name]} <span className="tag">peso {d.weight}%</span></span><span>{d.score}</span></div>
            <div className="bar"><i style={{ width: `${d.score}%` }} /></div>
            <p>{d.evidence}</p>
          </div>
        ))}
      </div>
    </>
  )
}
const Hooks = ({ hooks }: { hooks: any[] }) => (
  <div className="card">
    {hooks.map((h, i) => (
      <div className="hook" key={i}>
        <span className="ang">{h.angle}</span><b>{h.text}</b>
        <small>Por qué funciona: {h.why}</small><small>Primer plano: {h.visual_opening}</small>
      </div>
    ))}
  </div>
)
const Items = ({ rows, a, b, label }: { rows: any[]; a: string; b: string; label?: (r: any) => string }) => (
  <div className="card">
    {rows.map((c, i) => (
      <div className="item" key={i}>
        <span className={`sevchip ${sev(c.priority ?? c.severity)}`}>{c.priority ?? c.severity}</span>
        <div><b>{label ? label(c) : c[a]}</b><small>{c[b]}</small></div>
      </div>
    ))}
  </div>
)

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [run] = await q('select * from runs where id=$1 and user_id=$2', [id, user.id])
  if (!run) notFound()
  const t = TOOLS[run.tool as keyof typeof TOOLS]
  const r = run.result
  const active = run.status === 'QUEUED' || run.status === 'RUNNING'
  const cur = run.input.currency || 'PEN'

  return (
    <>
      <p><a href="/panel/history">Volver al historial</a></p>
      <h1>{t.title}</h1>
      <p className="tag">{run.cost ? `Costó ${coins(run.cost)}` : 'Gratis'} (análisis {run.id}, {new Date(run.created_at).toLocaleString('es-PE')})</p>
      {!active && run.input.assets && run.tool !== 'video' && run.tool !== 'transcribir' && (
        <div className="thumbs">{run.input.assets.map((a: string) => <img key={a} src={`/api/assets/${a}`} alt="Archivo analizado" />)}</div>
      )}
      {active && <RunProgress tool={run.tool} status={run.status} assets={run.input.assets || []} brand={run.input.brand?.name || user.brand.name} duration={run.input.duration} />}
      {run.status === 'FAILED' && (
        <div className="err">No pudimos completar este análisis: {run.error}. {run.cost ? 'Ya te devolvimos tus monedas. ' : ''}<a href={`/panel/tools/${run.tool}`}>Inténtalo de nuevo</a>.</div>
      )}

      {run.status === 'COMPLETED' && run.tool === 'profit' && (
        <>
          <div className="card price-result">
            <span className="eyebrow">{run.input.mode === 'suggest' ? 'TU PRECIO DE VENTA CALCULADO' : 'TU PRECIO DE VENTA'}</span>
            <h2>{run.input.mode === 'suggest' ? 'Véndelo desde' : 'Precio usado'}</h2>
            <div className="big">{money(r.inputs.price, cur)}</div>
            <p>Por cada producto vendido, te quedarían <b>{money(r.net_profit, cur)}</b> después de los gastos que ingresaste.</p>
            <span className="tag">Este precio cubre tus gastos y la ganancia elegida. Compáralo con tu mercado antes de publicar.</span>
          </div>
          <div className="card"><h2>Así se reparte cada venta</h2><div className="scroll"><table><tbody>
            <tr><td>Lo que paga tu cliente</td><td>{money(r.inputs.price, cur)}</td></tr>
            <tr><td>Lo que te cuesta el producto</td><td>{money(r.inputs.product_cost, cur)}</td></tr>
            <tr><td>Otros gastos que agregaste</td><td>{money(r.total_cost - r.inputs.product_cost, cur)}</td></tr>
            <tr><td><b>Lo que te queda a ti</b></td><td><b>{money(r.net_profit, cur)}</b></td></tr>
          </tbody></table></div></div>
          <div className="card"><h2>Si vendes más unidades</h2><div className="row">{[[10, r.profit_10], [50, r.profit_50], [100, r.profit_100]].map(([n, amount]) => <div key={n}><p className="tag">{n} productos</p><h3>{money(amount, cur)}</h3></div>)}</div><p className="tag">Suponiendo el mismo precio y gastos por producto.</p></div>
          <a className="btn ghost" href="/panel/tools/profit">Calcular otro precio ↗</a>
        </>
      )}

      {run.status === 'COMPLETED' && run.tool === 'hooks' && (
        <><p className="muted">Producto que vimos: {r.product}</p><Hooks hooks={r.hooks} /><p className="tag">{r.disclaimer}</p></>
      )}
      {run.status === 'COMPLETED' && run.tool === 'transcribir' && <TranscriptResult result={r} />}
      {run.status === 'COMPLETED' && run.tool === 'imagen' && <><section className="card"><span className="eyebrow">TU IDEA, EN IMAGEN</span><h2>Lista para revisar y descargar</h2><img src={`/api/assets/${r.asset_id}`} alt="Diseño generado a partir de tu idea" style={{ width: '100%', maxHeight: 700, objectFit: 'contain', borderRadius: 20 }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar imagen ↓</a> <a className="btn ghost" href="/panel/tools/imagen">Crear otra imagen ↗</a></section><section className="card"><h2>El prompt usado</h2><p style={{ whiteSpace: 'pre-wrap' }}>{r.prompt}</p><CopyText text={r.prompt} /></section></>}
      {run.status === 'COMPLETED' && run.tool === 'guion' && <ScriptResult result={r} />}
      {run.status === 'COMPLETED' && run.tool === 'whatsapp' && <><section className="card"><span className="eyebrow">LISTAS PARA COPIAR</span><h2>Tus respuestas de WhatsApp</h2>{r.replies.map((x: any) => <article key={x.situation} className="note"><b>{x.situation}</b><p className="tag">Cliente: “{x.customer}”</p><p style={{ whiteSpace: 'pre-wrap' }}>{x.reply}</p><CopyText text={x.reply} /></article>)}<CopyText text={r.replies.map((x: any) => `${x.situation}\n${x.reply}`).join('\n\n')} /></section><p className="note">{r.disclaimer}</p></>}
      {run.status === 'COMPLETED' && run.tool === 'copy' && <><section className="card"><span className="eyebrow">LISTO PARA PUBLICAR</span><h2>Tu publicación</h2>{r.captions.map((c: any) => { const full = `${c.text}\n\n${c.cta}\n\n${r.hashtags.join(' ')}`; return <article key={c.kind} className="note"><b>Versión {c.kind.toLowerCase()}</b><p style={{ whiteSpace: 'pre-wrap' }}>{full}</p><CopyText text={full} /></article> })}<h3>Primer comentario</h3><p>{r.first_comment}</p><CopyText text={r.first_comment} /></section><p className="note">{r.disclaimer}</p></>}
      {run.status === 'COMPLETED' && run.tool === 'imagen3d' && <section className="card"><span className="eyebrow">TU PRODUCTO EN 3D</span><h2>Lista para revisar y descargar</h2><img src={`/api/assets/${r.asset_id}`} alt="Imagen 3D del producto generada con IA" style={{ width: '100%', maxHeight: 700, objectFit: 'contain', borderRadius: 20 }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar imagen ↓</a> <a className="btn ghost" href="/panel/tools/imagen3d?modo=video">Hacer un video 3D ↗</a></section>}
      {run.status === 'COMPLETED' && run.tool === 'video3d' && <section className="card"><span className="eyebrow">TU PRODUCTO EN 3D</span><h2>Tu video de 8 segundos</h2><video src={`/api/assets/${r.asset_id}`} controls loop playsInline preload="metadata" style={{ width: '100%', maxHeight: 700, borderRadius: 20, background: '#000' }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar video ↓</a> <a className="btn ghost" href="/panel/tools/imagen3d?modo=video">Crear otro video ↗</a></section>}
      {run.status === 'COMPLETED' && run.tool === 'foto' && <><div className="photo-comparison"><section className="card"><h3>Tu foto original</h3><img src={`/api/assets/${r.original_id}`} alt="Foto original del producto" /></section><section className="card"><h3>{r.style === 'libre' ? 'Con tus cambios' : `Lista para ${r.style === 'catalogo' ? 'catálogo' : 'anuncio'}`}</h3><img src={`/api/assets/${r.asset_id}`} alt="Producto con fondo editado por IA" /><a className="btn" href={`/api/assets/${r.asset_id}?download=1`} download="producto-editado.webp">Descargar imagen ↓</a></section></div><p className="note">{r.disclaimer}</p></>}

      {run.status === 'COMPLETED' && run.tool === 'creativo' && (
        <><Score r={r} /><h2>Cambios priorizados</h2><Items rows={r.changes} a="change" b="why" /></>
      )}

      {run.status === 'COMPLETED' && run.tool === 'video' && (
        <>
          <Score r={r} />
          <h2>Fallas y momentos clave</h2>
          <Items rows={r.findings} a="issue" b="evidence" label={f => `Segundo ${f.timestamp_s}: ${f.issue}`} />
          <h2>Qué hacer ahora</h2>
          <Items rows={r.actions} a="action" b="expected_effect" />
          <h2>Hooks alternativos</h2><Hooks hooks={r.alternative_hooks} />
          <h2>Llamado a la acción sugerido</h2><div className="card">{r.cta_suggestion}</div>
        </>
      )}
    </>
  )
}
