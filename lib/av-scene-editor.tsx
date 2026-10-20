'use client'

import { useState } from 'react'
import type { Scene } from './av-story'
import { applyEndMode, endMode, type EndMode } from './av-editor-modes'

// Editor de la historia: barra fija con guardar/publicar, lista de capítulos a la izquierda y el capítulo
// elegido a la derecha. Por capítulo solo título y video son obligatorios; el final se decide con una sola pregunta.
type Data = { title: string; description: string; minutes: number; cover: string | null; character_image: string | null; print_template: string | null; print_qr: { x: number; y: number; size: number }; mission: { title: string; text: string; tips: string[] }; scenes: Scene[] }
type Result = { errors: string[]; warnings: string[]; unpublished?: boolean; published?: boolean; scenes?: Scene[] }

const MODES: { mode: EndMode; label: string; help: string }[] = [
  { mode: 'next', label: 'Sigue al siguiente capítulo', help: 'Si es el último, pasa a la misión de pintura.' },
  { mode: 'choose', label: 'El niño elige qué hacer', help: '2 o 3 botones, cada uno lleva a un capítulo.' },
  { mode: 'jump', label: 'Salta a otro capítulo', help: 'Útil para unir dos caminos.' },
  { mode: 'end', label: 'Termina la historia', help: 'Después va la misión de pintura.' },
]

function CloudUpload({ kind, value, onChange, slug, cloud, label }: { kind: 'video' | 'image'; value: string | null | undefined; onChange: (id: string | null) => void; slug: string; cloud: string; label: string }) {
  const [pct, setPct] = useState<number | null>(null)
  const [err, setErr] = useState('')
  async function upload(file: File) {
    setErr('')
    const sig = await fetch('/api/admin/aventuras/cloudinary-firma', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) }).then(r => r.json()).catch(() => null)
    if (!sig?.signature) return setErr('No se pudo preparar la subida.')
    const fd = new FormData()
    fd.append('file', file); fd.append('api_key', sig.api_key); fd.append('timestamp', String(sig.timestamp)); fd.append('signature', sig.signature); fd.append('folder', sig.folder)
    const x = new XMLHttpRequest()
    x.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloud}/${kind}/upload`)
    x.upload.onprogress = e => e.lengthComputable && setPct(Math.round(e.loaded / e.total * 100))
    x.onload = () => { setPct(null); try { const r = JSON.parse(x.responseText); if (r.public_id) onChange(r.public_id); else setErr(r.error?.message ?? 'Cloudinary rechazó el archivo.') } catch { setErr('Respuesta inválida de Cloudinary.') } }
    x.onerror = () => { setPct(null); setErr('Se cortó la conexión. Inténtalo de nuevo.') }
    setPct(0); x.send(fd)
  }
  const url = value && `https://res.cloudinary.com/${cloud}/${kind}/upload/q_auto,f_auto,w_480/${value}`
  return <div className={`ed-upload${url ? ' has' : ''}`}>
    {url && (kind === 'video' ? <video src={url} controls preload="metadata" /> : <img src={url} alt="" />)}
    {pct !== null ? <progress max={100} value={pct}>{pct}%</progress> : <label className="ed-pick">
      {url ? `Cambiar ${kind === 'video' ? 'video' : 'imagen'}` : `＋ ${label}`}
      <input type="file" accept={kind === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/jpeg,image/png,image/webp'} onChange={e => { const f = e.currentTarget.files?.[0]; if (f) upload(f); e.currentTarget.value = '' }} aria-label={label} />
    </label>}
    {value && kind === 'image' && pct === null && <button type="button" className="link" onClick={() => onChange(null)}>Quitar</button>}
    {err && <p className="err">{err}</p>}
  </div>
}

export function StoryEditor({ id, slug, published: pub0, cloud, initial, collectionTemplate }: { id: string; slug: string; published: boolean; cloud: string; initial: Data; collectionTemplate: string | null }) {
  const [d, setD] = useState<Data>(initial)
  const [published, setPublished] = useState(pub0)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [sel, setSel] = useState(0)
  const set = (patch: Partial<Data>) => { setD(x => ({ ...x, ...patch })); setDirty(true) }
  const setScene = (i: number, s: Scene) => set({ scenes: d.scenes.map((x, j) => j === i ? s : x) })
  const move = (i: number, by: number) => { const s = [...d.scenes]; const [x] = s.splice(i, 1); s.splice(i + by, 0, x); set({ scenes: s }); setSel(i + by) }
  const remove = (i: number) => {
    const gone = d.scenes[i].id
    set({ scenes: d.scenes.filter((_, j) => j !== i).map(s => ({ ...s, next: s.next === gone ? null : s.next, choices: s.choices.filter(c => c.next !== gone) })) })
    setSel(Math.max(0, i - 1))
  }
  const add = () => { set({ scenes: [...d.scenes, { id: `n${Date.now()}`, title: '', video: '', description: '', image: null, next: null, ending: false, choices: [] }] }); setSel(d.scenes.length) }
  const name = (sid: string) => { const i = d.scenes.findIndex(s => s.id === sid); return `${i + 1}. ${d.scenes[i]?.title || 'Sin título'}` }

  async function save(): Promise<Result | null> {
    setBusy(true)
    const r = await fetch(`/api/admin/aventuras/historias/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()).catch(() => ({ errors: ['No se pudo guardar. Revisa tu conexión.'], warnings: [] }))
    setBusy(false); setResult(r)
    if (r.unpublished) setPublished(false)
    if (r.scenes) { setD(x => ({ ...x, scenes: r.scenes })); setDirty(false) } // ids reales: el próximo guardado no duplica capítulos
    return r
  }
  async function publish(action: 'publish' | 'unpublish') {
    if (action === 'publish' && !('warnings' in (await save() ?? {}))) return // datos inválidos: ni se guardó
    setBusy(true)
    const r = await fetch(`/api/admin/aventuras/historias/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }).then(r => r.json())
    setBusy(false); setResult(r); setPublished(r.published)
  }

  const s = d.scenes[sel]
  const mode = s && endMode(s)
  const others = s ? d.scenes.filter(x => x.id !== s.id) : []
  return <div className="ed">
    <style>{CSS}</style>
    <header className="ed-bar">
      <div><b>{d.title || 'Sin título'}</b> <span className={`av-badge${published ? ' on' : ''}`}>{published ? 'Publicada' : 'Borrador'}</span>
        {dirty && <span className="ed-dirty">● Cambios sin guardar</span>}</div>
      <div className="ed-actions">
        <a className="btn ghost" href={`/aventuras/${slug}?preview=1`} target="_blank" rel="noopener">Vista previa ↗</a>
        <button type="button" className="btn ghost" onClick={save} disabled={busy}>Guardar</button>
        {published ? <button type="button" className="btn ghost" onClick={() => publish('unpublish')} disabled={busy}>Despublicar</button>
          : <button type="button" onClick={() => publish('publish')} disabled={busy}>Publicar</button>}
      </div>
    </header>
    {result && <div className="ed-result" role="status">
      {result.unpublished && <p className="av-errs">La historia tenía errores y se despublicó para que ningún niño se quede atascado.</p>}
      {!!result.errors?.length && <ul className="av-errs">{result.errors.map(e => <li key={e}>{e}</li>)}</ul>}
      {!!result.warnings?.length && <ul className="av-warns">{result.warnings.map(e => <li key={e}>{e}</li>)}</ul>}
      {!result.errors?.length && <p className="ok">{result.published ? '¡Publicada!' : 'Guardado.'}</p>}
    </div>}

    <div className="ed-top">
      <section className="ed-card"><h3><span className="ed-n">1</span> La aventura</h3>
        <label htmlFor="t">Título</label><input id="t" value={d.title} onChange={e => set({ title: e.target.value })} maxLength={160} />
        <label htmlFor="ds">Descripción corta (se ve en la portada)</label><textarea id="ds" value={d.description} onChange={e => set({ description: e.target.value })} rows={2} maxLength={600} />
        <label htmlFor="mi">Duración aproximada</label><div className="ed-inline"><input id="mi" type="number" min={1} max={60} value={d.minutes} onChange={e => set({ minutes: Number(e.target.value) })} /> minutos</div>
      </section>
      <section className="ed-card"><h3><span className="ed-n">2</span> Personaje</h3>
        <p className="tag">Se ve en la portada, la misión y el diploma. Mejor PNG cuadrado con fondo transparente.</p>
        <CloudUpload kind="image" label="Subir imagen del personaje" value={d.character_image} onChange={v => set({ character_image: v })} slug={slug} cloud={cloud} />
      </section>
      <section className="ed-card"><h3><span className="ed-n">3</span> Misión de pintura</h3>
        <label htmlFor="mt">Título</label><input id="mt" value={d.mission.title} onChange={e => set({ mission: { ...d.mission, title: e.target.value } })} placeholder="¡Ahora empieza tu misión!" />
        <label htmlFor="mx">Qué debe hacer el niño</label><textarea id="mx" value={d.mission.text} onChange={e => set({ mission: { ...d.mission, text: e.target.value } })} rows={2} />
        <label htmlFor="mtips">Consejos (uno por línea)</label><textarea id="mtips" value={d.mission.tips.join('\n')} onChange={e => set({ mission: { ...d.mission, tips: e.target.value.split('\n').slice(0, 8) } })} rows={3} />
      </section>
    </div>

    <section className="ed-card ed-print"><h3><span className="ed-n">5</span> Tarjeta para imprimir (QR del kit)</h3>
      <p className="tag">Al imprimir un lote, el QR de cada kit se pone solo en el recuadro del diseño. {collectionTemplate && !d.print_template ? 'Ahora se usa el diseño de la colección; sube otro solo si esta aventura necesita uno propio.' : 'Sube el diseño de la tarjeta y ajusta la posición si tu diseño tiene el recuadro en otro lugar.'}</p>
      <div className="ed-print-grid">
        <div>
          <CloudUpload kind="image" label={collectionTemplate ? 'Subir un diseño propio (opcional)' : 'Subir diseño de la tarjeta'} value={d.print_template} onChange={v => set({ print_template: v })} slug={slug} cloud={cloud} />
          {([['x', 'Horizontal', 0, 95], ['y', 'Vertical', 0, 95], ['size', 'Tamaño del QR', 5, 60]] as const).map(([k, l, min, max]) =>
            <label key={k} className="ed-range">{l} <b>{d.print_qr[k]}%</b>
              <input type="range" min={min} max={max} step={0.1} value={d.print_qr[k]} onChange={e => set({ print_qr: { ...d.print_qr, [k]: Number(e.target.value) } })} /></label>)}
          <button type="button" className="link" onClick={() => set({ print_qr: { x: 76.6, y: 83.5, size: 19.4 } })}>Volver a la posición de la plantilla Halloween</button>
        </div>
        {(d.print_template || collectionTemplate) && <div className="ed-card-preview" aria-label="Vista previa de la tarjeta">
          <img src={d.print_template ? `https://res.cloudinary.com/${cloud}/image/upload/q_auto,f_auto,w_600/${d.print_template}` : collectionTemplate!} alt="" />
          <img className="ed-qr" src={`/api/admin/aventuras/qr/a-${slug}?format=svg`} alt="QR de ejemplo" style={{ left: `${d.print_qr.x}%`, top: `${d.print_qr.y}%`, width: `${d.print_qr.size}%` }} />
        </div>}
      </div>
    </section>

    <h3 className="ed-h"><span className="ed-n">4</span> Capítulos</h3>
    <div className="ed-split">
      <nav className="ed-list" aria-label="Capítulos">
        {d.scenes.map((x, i) => <button type="button" key={x.id} className={i === sel ? 'on' : ''} onClick={() => setSel(i)} aria-current={i === sel}>
          <span className="ed-num">{i + 1}</span><span className="ed-t">{x.title || 'Sin título'}</span>
          <span className={x.video ? 'ed-ok' : 'ed-warn'} title={x.video ? 'Tiene video' : 'Falta el video'}>{x.video ? '✓' : '⚠'}</span>
        </button>)}
        <button type="button" className="ed-add" onClick={add}>＋ Agregar capítulo</button>
      </nav>

      {s ? <section className="ed-card ed-scene" aria-label={`Capítulo ${sel + 1}`}>
        <div className="ed-scene-head"><h3>Capítulo {sel + 1}{sel === 0 && <small> · inicio de la historia</small>}</h3>
          <div><button type="button" className="link" disabled={sel === 0} onClick={() => move(sel, -1)} aria-label="Subir capítulo">↑</button>
            <button type="button" className="link" disabled={sel === d.scenes.length - 1} onClick={() => move(sel, 1)} aria-label="Bajar capítulo">↓</button>
            <button type="button" className="link ed-del" onClick={() => remove(sel)}>Borrar</button></div></div>
        <label htmlFor="st">Título *</label><input id="st" value={s.title} onChange={e => setScene(sel, { ...s, title: e.target.value })} maxLength={160} placeholder="Ej. El bosque encantado" />
        <label>Video *</label>
        <CloudUpload kind="video" label="Subir video del capítulo" value={s.video} onChange={v => setScene(sel, { ...s, video: v ?? '' })} slug={slug} cloud={cloud} />

        <fieldset className="ed-modes"><legend>¿Qué pasa al terminar el video?</legend>
          {MODES.map(m => <label key={m.mode} className={mode === m.mode ? 'on' : ''}>
            <input type="radio" name={`mode-${s.id}`} checked={mode === m.mode} disabled={m.mode !== 'next' && m.mode !== 'end' && !others.length}
              onChange={() => setScene(sel, applyEndMode(s, m.mode, d.scenes))} />
            <span><b>{m.label}</b><small>{m.help}</small></span></label>)}
        </fieldset>
        {mode === 'choose' && <div className="ed-choices">
          {s.choices.map((c, j) => <div className="ed-choice" key={j}>
            <input aria-label={`Texto de la opción ${j + 1}`} value={c.label} placeholder={`Botón ${j + 1}, ej. Entrar al bosque`} onChange={e => setScene(sel, { ...s, choices: s.choices.map((x, k) => k === j ? { ...x, label: e.target.value } : x) })} />
            <span>→</span>
            <select aria-label={`Destino de la opción ${j + 1}`} value={c.next} onChange={e => setScene(sel, { ...s, choices: s.choices.map((x, k) => k === j ? { ...x, next: e.target.value } : x) })}>
              {others.map(x => <option key={x.id} value={x.id}>{name(x.id)}</option>)}</select>
            {s.choices.length > 2 && <button type="button" className="link" onClick={() => setScene(sel, { ...s, choices: s.choices.filter((_, k) => k !== j) })}>Quitar</button>}
          </div>)}
          {s.choices.length < 3 && <button type="button" className="link" onClick={() => setScene(sel, { ...s, choices: [...s.choices, { label: '', next: others[0].id }] })}>＋ Tercera opción</button>}
        </div>}
        {mode === 'jump' && <select aria-label="Capítulo al que salta" value={s.next ?? ''} onChange={e => setScene(sel, { ...s, next: e.target.value })}>
          {others.map(x => <option key={x.id} value={x.id}>{name(x.id)}</option>)}</select>}

        <details className="ed-more"><summary>Más opciones (texto bajo el video, imagen de portada)</summary>
          <label htmlFor="sd">Texto bajo el video (ayuda a quien no puede escuchar)</label><textarea id="sd" value={s.description ?? ''} onChange={e => setScene(sel, { ...s, description: e.target.value })} rows={2} />
          <label>Imagen antes de dar play</label>
          <CloudUpload kind="image" label="Subir imagen" value={s.image} onChange={v => setScene(sel, { ...s, image: v })} slug={slug} cloud={cloud} />
        </details>
      </section> : <section className="ed-card ed-empty"><p>Aún no hay capítulos.</p><p className="tag">Solo necesitas un título y un video por capítulo.</p>
        <button type="button" onClick={add}>＋ Agregar el primer capítulo</button></section>}
    </div>
  </div>
}

const CSS = `
.ed-bar{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:var(--cream);padding:10px 0;border-bottom:1px solid var(--line);margin-bottom:12px}
.ed-bar .btn,.ed-bar button{margin:0;padding:9px 16px}.ed-actions{display:flex;gap:8px;flex-wrap:wrap}
.ed-dirty{color:var(--orange-dark);font-weight:700;font-size:.85rem;margin-left:8px}
.ed-top{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.ed-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px}
.ed-card h3,.ed-h{display:flex;align-items:center;gap:8px;margin:0 0 6px}.ed-h{margin:26px 0 12px}
.ed-n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--orange);color:var(--ink);font-size:.85rem;font-weight:800}
.ed-inline{display:flex;align-items:center;gap:8px}.ed-inline input{max-width:90px}
.ed-split{display:grid;grid-template-columns:260px 1fr;gap:14px;align-items:start}
@media(max-width:760px){.ed-split{grid-template-columns:1fr}.ed-list{position:static}.ed-bar .ed-actions{width:100%}.ed-bar .ed-actions>*{flex:1;justify-content:center;white-space:nowrap;padding:9px 8px}}
.ed-list{display:grid;gap:6px;position:sticky;top:70px}
.ed-list button{display:flex;align-items:center;gap:10px;margin:0;padding:10px 12px;background:#fff;color:var(--ink);border:1px solid var(--line);border-radius:12px;text-align:left;font-weight:600}
.ed-list button:hover{background:var(--soft);color:var(--ink);border-color:var(--orange)}
.ed-list button.on{border:2px solid var(--orange);background:var(--soft)}
.ed-num{display:inline-grid;place-items:center;min-width:24px;height:24px;border-radius:8px;background:var(--navy);color:#fff;font-size:.8rem}
.ed-t{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ed-ok{color:var(--ok)}.ed-warn{color:var(--bad)}
.ed-list .ed-add{justify-content:center;border-style:dashed;color:var(--orange-dark)}
.ed-scene-head{display:flex;justify-content:space-between;align-items:center}.ed-scene-head small{font-weight:500;color:var(--muted)}
.ed-scene-head button{margin:0 2px;font-size:1.1rem;min-width:40px;min-height:40px}.ed-del{color:var(--bad)!important}
.ed-upload{display:grid;gap:8px;justify-items:start}.ed-upload video,.ed-upload img{width:100%;max-width:420px;border-radius:12px;background:#000}
.ed-upload img{background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/16px 16px;max-width:200px}
.ed-pick{position:relative;display:inline-flex;align-items:center;gap:6px;margin:0;padding:12px 18px;border:2px dashed var(--orange);border-radius:12px;background:var(--soft);color:var(--orange-dark);font-weight:800;cursor:pointer}
.ed-upload:not(.has) .ed-pick{width:100%;justify-content:center;padding:22px}
.ed-pick input{position:absolute;inset:0;opacity:0;cursor:pointer}.ed-pick:focus-within{outline:3px solid var(--navy)}
.ed-upload progress{width:100%;max-width:420px}
.ed-modes{border:0;padding:0;margin:18px 0 8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.ed-modes legend{font-weight:800;color:var(--navy);margin-bottom:8px}
.ed-modes label{display:flex;gap:10px;align-items:flex-start;margin:0;padding:12px;border:1px solid var(--line);border-radius:12px;cursor:pointer;font-weight:500}
.ed-modes label.on{border:2px solid var(--orange);background:var(--soft)}.ed-modes input{width:auto;margin-top:3px}
.ed-modes small{display:block;color:var(--muted);font-size:.82rem}
.ed-choices{display:grid;gap:8px;background:var(--soft);border-radius:12px;padding:12px}
.ed-choice{display:grid;grid-template-columns:1fr auto 1fr auto;gap:8px;align-items:center}
@media(max-width:600px){.ed-choice{grid-template-columns:1fr;border-bottom:1px dashed var(--line);padding-bottom:8px}.ed-choice>span{display:none}}
.ed-card button.link{min-height:40px}.ed-more{margin-top:16px}.ed-more summary{cursor:pointer;font-weight:700;color:var(--navy)}
.ed-empty{text-align:center}
.ed-print{margin-top:14px}.ed-print-grid{display:grid;grid-template-columns:1fr minmax(0,320px);gap:16px;align-items:start}
@media(max-width:700px){.ed-print-grid{grid-template-columns:1fr}}
.ed-range{display:grid;gap:4px;margin:12px 0 0}.ed-range input{padding:0;border:0;accent-color:var(--orange)}
.ed-card-preview{position:relative;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px #0002}.ed-card-preview img{display:block;width:100%}
.ed-card-preview .ed-qr{position:absolute;height:auto;background:#fff}
`
