import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { q } from '@/lib/db'
import { coins, COST } from '@/lib/credits'
import { TWEAKS, tweakOrder } from '@/lib/image-brief'
import { LABEL } from '@/lib/scoring'
import { money, PROMPT_TARGETS, TOOLS } from '@/lib/meta'
import { PHOTO_STYLES } from '@/lib/photo-ai'
import { OrderLink } from '@/lib/order-link'
import { CopyText } from '@/lib/copy-text'
import { RunProgress } from '@/lib/run-progress'
import { TranscriptResult } from '@/lib/transcript-result'
import { ScriptResult } from '@/lib/script-result'

// Cambiar una sola cosa: un tipo de cambio con su regla probada; el resto de la imagen queda igual.
// Con 2+ cambios acumulados, "Volver a la original" los aplica todos juntos sobre la primera imagen (si la cadena se desvió).
const Tweak = ({ id, changes = [] }: { id: string; changes?: { kind: string; change: string }[] }) => (
  <section>
    <form className="form" method="post" action="/api/runs"><input type="hidden" name="tool" value="imagen" /><input type="hidden" name="from_run" value={id} />
      <div className="form-heading"><span className="form-step">↻</span><div><h2>Cambiar una sola cosa</h2><p>Un cambio por vuelta y el resto queda igual. Si cambias varias cosas a la vez, no sabrás cuál funcionó. Deja el encuadre para el final.</p></div></div>
      <fieldset className="tweak-kinds"><legend>¿Qué quieres cambiar?</legend>{Object.entries(TWEAKS).map(([v, [label]], i) => <label key={v} className="check"><input type="radio" name="kind" value={v} defaultChecked={i === 0} /> {label}</label>)}</fieldset>
      <label htmlFor="change">Describe el cambio</label><input id="change" name="change" required minLength={3} maxLength={300} placeholder={Object.values(TWEAKS).map(t => t[1]).slice(0, 3).join(' / ')} />
      <p className="tag">En «Texto» escribe solo las palabras nuevas (máximo 3 o 4). Si el texto no sale bien a la segunda o tercera vez, genera sin texto y agrégalo en tu editor.</p>
      <p className="note">Costo: <b>{coins(COST.imagen)}</b>. Si falla, se devuelven automáticamente.</p><button>Aplicar el cambio <span aria-hidden="true">↗</span></button></form>
    {changes.length >= 2 && <form method="post" action="/api/runs" className="note"><input type="hidden" name="tool" value="imagen" /><input type="hidden" name="from_run" value={id} /><input type="hidden" name="rebase" value="1" />
      <b>¿Se fue desviando?</b><p className="tag">Vuelve a la primera imagen y aplica tus {changes.length} cambios de una sola vez (el encuadre al final):</p><ol>{tweakOrder(changes).map((c, i) => <li key={i}>{TWEAKS[c.kind]?.[0] ?? 'Cambio'}: {c.change}</li>)}</ol><button className="btn ghost">Volver a la original con todos los cambios ({coins(COST.imagen)}) ↗</button></form>}
  </section>
)
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
      <Title tip="Calificamos tu contenido en varios aspectos del 0 al 100. El peso indica cuánto influye cada aspecto en el puntaje total.">Puntaje por dimensión</Title>
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
const Tip = ({ text }: { text: string }) => <span className="tip" tabIndex={0} role="note" aria-label={text} data-tip={text}>?</span>
const Title = ({ children, tip }: { children: ReactNode; tip: string }) => <h2 className="tipped">{children} <Tip text={tip} /></h2>

const ANGLE_INFO: Record<string, [string, string, string]> = {
  curiosidad: ['🤔', 'Curiosidad', 'Deja una pregunta en el aire para que se queden hasta el final por la respuesta.'],
  pov: ['👀', 'POV (punto de vista)', 'Pone a tu cliente dentro de la escena, como si lo viviera en primera persona.'],
  problema: ['😣', 'Problema', 'Nombra el dolor que tu producto resuelve; quien lo sufre se detiene a mirar.'],
  humor: ['😂', 'Humor', 'Hace reír y provoca que lo comenten y compartan con amigos.'],
  venta: ['💰', 'Venta directa', 'Va directo al beneficio, la oferta o el precio para quien ya está listo para comprar.'],
  ugc: ['🤳', 'UGC (cliente real)', 'Suena como un cliente contando su experiencia; genera confianza.'],
}
const Hooks = ({ hooks }: { hooks: any[] }) => {
  const groups = [...new Set(hooks.map(h => h.angle))].map(a => [a, hooks.filter(h => h.angle === a)] as const)
  let n = 0
  return (
    <>
      <div className="hooks-summary">
        <div><strong>{hooks.length}</strong><span>hooks listos</span></div>
        <div><strong>{groups.length}</strong><span>ángulos distintos</span></div>
        <p>Un <b>hook</b> es la primera frase o los primeros 3 segundos de tu video: lo que hace que la gente deje de deslizar. Prueba varios ángulos y quédate con el que más retiene.</p>
      </div>
      {groups.map(([a, list]) => {
        const [emoji, name, desc] = ANGLE_INFO[a] ?? ['✨', a, '']
        return (
          <section className="card hook-group" key={a}>
            <header><span className="hook-emoji" aria-hidden="true">{emoji}</span><div><h3>{name} <span className="tag">· {list.length} {list.length === 1 ? 'hook' : 'hooks'}</span></h3>{desc && <p className="tag">{desc}</p>}</div></header>
            {list.map((h, i) => (
              <article className="hook" key={i}>
                <span className="hook-n">#{++n}</span>
                <div>
                  <b>“{h.text}”</b>
                  <dl>
                    <dt>💡 Por qué funciona</dt><dd>{h.why}</dd>
                    <dt>🎬 Cómo abrir el video</dt><dd>{h.visual_opening}</dd>
                  </dl>
                  <CopyText text={h.text} />
                </div>
              </article>
            ))}
          </section>
        )
      })}
    </>
  )
}
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

export default async function RunPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser()
  const { id } = await params
  const { saved } = await searchParams
  if (!/^\d+$/.test(id)) notFound()
  const [run] = await q('select * from runs where id=$1 and user_id=$2', [id, user.id])
  if (!run) notFound()
  const t = TOOLS[run.tool as keyof typeof TOOLS]
  const r = run.result
  const active = run.status === 'QUEUED' || run.status === 'RUNNING'
  const cur = run.input.currency || 'PEN'
  const [page] = run.tool === 'landing' && r?.token ? await q('select page,product_name,active from order_links where token=$1 and user_id=$2', [r.token, user.id]) : []

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
        <><p className="muted">Producto que vimos: {r.product}</p><Title tip="Frases de apertura agrupadas por ángulo. Copia la que más te guste y úsala como primera línea o primeros segundos de tu video.">Tus hooks por ángulo</Title><Hooks hooks={r.hooks} /><p className="tag">{r.disclaimer}</p></>
      )}
      {run.status === 'COMPLETED' && run.tool === 'prompt' && (() => { const [label, where, href, toolName] = PROMPT_TARGETS[r.target]; return <>
        <section className="card"><span className="eyebrow">LISTO PARA COPIAR</span><Title tip={`Pega este prompt en ${where}. Si ves [completa: dato], reemplázalo con tu información real.`}>Tu prompt para {label.toLowerCase()}</Title><p className="prompt-box">{r.prompt}</p><CopyText text={r.prompt} />{r.translation && <details><summary>Qué dice en español</summary><p className="prompt-box">{r.translation}</p></details>}</section>
        <div className="row"><section className="card"><Title tip="Lo que agregamos a tu idea para que la IA entienda exactamente qué quieres.">✨ Qué mejoramos</Title><ul>{r.improvements.map((x: string) => <li key={x}>{x}</li>)}</ul></section>
        <section className="card"><Title tip="Pasos para usar el prompt en la herramienta de destino.">🧭 Cómo usarlo</Title><ol>{r.how_to.map((x: string) => <li key={x}>{x}</li>)}</ol></section></div>
        {r.missing.length > 0 && <section className="card"><Title tip="Si agregas estos datos, el resultado será más fiel a tu producto.">📝 Datos que conviene completar</Title><ul>{r.missing.map((x: string) => <li key={x}>{x}</li>)}</ul></section>}
        <div className="note"><b>¿Prefieres que lo hagamos por ti?</b><p className="tag">Con {toolName} lo creas directo en Tendy, sin copiar ni pegar.</p><a className="btn" href={href}>Ir a {toolName} ↗</a> <a className="btn ghost" href="/panel/tools/prompt">Mejorar otro prompt</a></div>
        <p className="note">{r.disclaimer}</p></> })()}
      {run.status === 'COMPLETED' && run.tool === 'landing' && page && <>
        <section className="card"><span className="eyebrow">{page.active ? 'TU PÁGINA ESTÁ PUBLICADA' : 'PÁGINA DESACTIVADA'}</span><Title tip="Comparte este enlace en tu bio, estados de WhatsApp o anuncios. Los pedidos que lleguen aparecen en Mi enlace de pedidos.">{page.product_name}</Title>
          {page.active && <><OrderLink token={r.token} /><a className="btn ghost" href="/panel/orders">Ver pedidos recibidos</a></>}</section>
        <form className="form" method="post" action="/api/order-links"><input type="hidden" name="token" value={r.token} /><input type="hidden" name="action" value="page" /><input type="hidden" name="run" value={run.id} />
          <div className="form-heading"><span className="form-step">✎</span><div><h2>Edita los textos de tu página</h2><p>Completa lo que esté entre corchetes y ajusta lo que quieras. Los cambios se ven al instante.</p></div></div>
          <label htmlFor="headline">Titular</label><input id="headline" name="headline" required maxLength={90} defaultValue={page.page.headline} />
          <label htmlFor="subheadline">Subtítulo</label><textarea id="subheadline" name="subheadline" required maxLength={220} rows={2} defaultValue={page.page.subheadline} />
          <label htmlFor="benefits">Beneficios (uno por línea: Título | explicación)</label><textarea id="benefits" name="benefits" required rows={6} maxLength={1600} defaultValue={page.page.benefits.map((b: any) => `${b.title} | ${b.text}`).join('\n')} />
          <label htmlFor="faqs">Preguntas frecuentes (una por línea: Pregunta | respuesta)</label><textarea id="faqs" name="faqs" required rows={6} maxLength={2800} defaultValue={page.page.faqs.map((f: any) => `${f.q} | ${f.a}`).join('\n')} />
          <div className="row"><div><label htmlFor="cta">Texto del botón</label><input id="cta" name="cta" required maxLength={40} defaultValue={page.page.cta} /></div><div><label htmlFor="whatsapp">WhatsApp (con código de país)</label><input id="whatsapp" name="whatsapp" type="tel" maxLength={20} defaultValue={page.page.whatsapp} /></div></div>
          {saved === '1' && <p className="ok" role="status">Cambios guardados. Ya se ven en tu página.</p>}{saved === '0' && <p className="err">Revisa los textos: cada beneficio y pregunta necesita «texto | texto», y el WhatsApp de 8 a 15 dígitos.</p>}
          <button>Guardar cambios</button></form>
        <p className="note">{r.disclaimer}</p></>}
      {run.status === 'COMPLETED' && run.tool === 'transcribir' && <TranscriptResult result={r} />}
      {run.status === 'COMPLETED' && run.tool === 'imagen' && <><section className="card"><span className="eyebrow">TU IDEA, EN IMAGEN</span><h2>{r.applied ? r.rebase ? 'La original con todos tus cambios' : 'Tu imagen con el cambio' : 'Lista para revisar y descargar'}</h2>{r.applied && <p className="tag">{r.rebase ? 'Cambios aplicados juntos' : 'Cambio aplicado'}: {r.applied.map((c: any) => `${TWEAKS[c.kind]?.[0] ?? 'Cambio'} → “${c.change}”`).join(' · ')}. Arriba ves la imagen de partida.</p>}<img src={`/api/assets/${r.asset_id}`} alt="Diseño generado a partir de tu idea" style={{ width: '100%', maxHeight: 700, objectFit: 'contain', borderRadius: 20 }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar imagen ↓</a> <a className="btn ghost" href="/panel/tools/imagen">Crear otra imagen ↗</a></section><section className="card"><h2>El prompt usado</h2><p style={{ whiteSpace: 'pre-wrap' }}>{r.prompt}</p><CopyText text={r.prompt} /></section><Tweak id={run.id} changes={r.changes} /></>}
      {run.status === 'COMPLETED' && run.tool === 'ficha' && <section className="card"><span className="eyebrow">GUARDADA EN TU PRODUCTO</span><h2>Ficha visual de {r.product_name}</h2><p className="prompt-box">{r.spec}</p><CopyText text={r.spec} /><p className="note">{r.disclaimer} Desde ahora, al elegir este producto en Foto, Imagen o 3D, la ficha se agrega sola al prompt. Si usas otra IA, pégala dentro de tu prompt.</p><a className="btn" href={`/panel/tools/imagen?modo=fondo&producto=${r.product_id}`}>Preparar una foto con esta ficha ↗</a> <a className="btn ghost" href={`/panel/products/${r.product_id}`}>Volver a mi producto</a></section>}
      {run.status === 'COMPLETED' && run.tool === 'retrato' && <><section className="card"><span className="eyebrow">{r.look === 'perfil' ? 'TU RETRATO DE MARCA' : 'TU PORTADA'}</span><h2>Lista para revisar y descargar</h2><img src={`/api/assets/${r.asset_id}`} alt={r.look === 'perfil' ? 'Retrato generado con IA a partir de tus fotos' : 'Portada tipo revista generada con IA'} style={{ width: '100%', maxHeight: 700, objectFit: 'contain', borderRadius: 20 }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar imagen ↓</a> <a className="btn ghost" href="/panel/tools/imagen?modo=retrato">Crear otra ↗</a></section><Tweak id={run.id} /></>}
      {run.status === 'COMPLETED' && run.tool === 'guion' && <ScriptResult result={r} />}
      {run.status === 'COMPLETED' && run.tool === 'whatsapp' && <><section className="card"><span className="eyebrow">LISTAS PARA COPIAR</span><h2>Tus respuestas de WhatsApp</h2>{r.replies.map((x: any) => <article key={x.situation} className="note"><b>{x.situation}</b><p className="tag">Cliente: “{x.customer}”</p><p style={{ whiteSpace: 'pre-wrap' }}>{x.reply}</p><CopyText text={x.reply} /></article>)}<CopyText text={r.replies.map((x: any) => `${x.situation}\n${x.reply}`).join('\n\n')} /></section><p className="note">{r.disclaimer}</p></>}
      {run.status === 'COMPLETED' && run.tool === 'copy' && <><section className="card"><span className="eyebrow">LISTO PARA PUBLICAR</span><h2>Tu publicación</h2>{r.captions.map((c: any) => { const full = `${c.text}\n\n${c.cta}\n\n${r.hashtags.join(' ')}`; return <article key={c.kind} className="note"><b>Versión {c.kind.toLowerCase()}</b><p style={{ whiteSpace: 'pre-wrap' }}>{full}</p><CopyText text={full} /></article> })}<h3>Primer comentario</h3><p>{r.first_comment}</p><CopyText text={r.first_comment} /></section><p className="note">{r.disclaimer}</p></>}
      {run.status === 'COMPLETED' && run.tool === 'imagen3d' && <section className="card"><span className="eyebrow">TU PRODUCTO EN 3D</span><h2>Lista para revisar y descargar</h2><img src={`/api/assets/${r.asset_id}`} alt="Imagen 3D del producto generada con IA" style={{ width: '100%', maxHeight: 700, objectFit: 'contain', borderRadius: 20 }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar imagen ↓</a> <a className="btn ghost" href="/panel/tools/imagen3d?modo=video">Hacer un video 3D ↗</a></section>}
      {run.status === 'COMPLETED' && run.tool === 'imagen3d' && <Tweak id={run.id} />}
      {run.status === 'COMPLETED' && run.tool === 'video3d' && <section className="card"><span className="eyebrow">TU PRODUCTO EN 3D</span><h2>Tu video de 8 segundos</h2><video src={`/api/assets/${r.asset_id}`} controls loop playsInline preload="metadata" style={{ width: '100%', maxHeight: 700, borderRadius: 20, background: '#000' }} /><p className="note">{r.disclaimer}</p><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar video ↓</a> <a className="btn ghost" href="/panel/tools/imagen3d?modo=video">Crear otro video ↗</a></section>}
      {run.status === 'COMPLETED' && run.tool === 'foto' && <><div className="photo-comparison"><section className="card"><h3>Tu foto original</h3><img src={`/api/assets/${r.original_id}`} alt="Foto original del producto" /></section><section className="card"><h3>{r.style === 'sinfondo' ? 'Sin fondo' : r.style === 'libre' ? 'Con tus cambios' : `Lista: ${(PHOTO_STYLES[r.style]?.[0] ?? r.style).split(' · ')[0].toLowerCase()}`}</h3><img src={`/api/assets/${r.asset_id}`} alt={r.style === 'sinfondo' ? 'Producto recortado sin fondo' : 'Producto con fondo editado por IA'} style={r.style === 'sinfondo' ? { background: 'repeating-conic-gradient(#d9d9d9 0 25%, #fff 0 50%) 50% / 20px 20px' } : undefined} /><a className="btn" href={`/api/assets/${r.asset_id}?download=1`}>Descargar PNG ↓</a></section></div><p className="note">{r.disclaimer}</p>{r.style !== 'sinfondo' && <Tweak id={run.id} />}</>}

      {run.status === 'COMPLETED' && run.tool === 'creativo' && (
        <><Score r={r} /><Title tip="Mejoras ordenadas por impacto: empieza por las marcadas como Crítico.">Cambios priorizados</Title><Items rows={r.changes} a="change" b="why" /></>
      )}

      {run.status === 'COMPLETED' && run.tool === 'video' && (
        <>
          <Score r={r} />
          <Title tip="Lo que vimos en tu video, segundo a segundo. Los tiempos son aproximados.">Fallas y momentos clave</Title>
          <Items rows={r.findings} a="issue" b="evidence" label={f => `Segundo ${f.timestamp_s}: ${f.issue}`} />
          <Title tip="Acciones concretas para tu próxima versión del video y el efecto que esperamos de cada una.">Qué hacer ahora</Title>
          <Items rows={r.actions} a="action" b="expected_effect" />
          <Title tip="Otras formas de empezar tu video para captar atención en los primeros segundos. Grábalas y compara cuál retiene más.">Hooks alternativos</Title><Hooks hooks={r.alternative_hooks} />
          <Title tip="La frase final que le dice a tu cliente qué hacer: escribir, comprar, comentar, etc.">Llamado a la acción sugerido</Title><div className="card">{r.cta_suggestion}</div>
        </>
      )}
    </>
  )
}
