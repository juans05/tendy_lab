'use client'

import { useState } from 'react'
import type { Scene } from './av-story'

// Editor de la historia: solo título y video son obligatorios por capítulo; lo demás va en "Opcional".
type Data = { title: string; description: string; minutes: number; cover: string | null; mission: { title: string; text: string; tips: string[] }; scenes: Scene[] }
type Result = { errors: string[]; warnings: string[]; unpublished?: boolean; published?: boolean; scenes?: Scene[] }

function CloudUpload({ kind, value, onChange, slug, cloud }: { kind: 'video' | 'image'; value: string | null | undefined; onChange: (id: string | null) => void; slug: string; cloud: string }) {
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
  return <div>
    {url && (kind === 'video' ? <video src={url} controls preload="metadata" style={{ width: '100%', maxWidth: 360, borderRadius: 10 }} /> : <img src={url} alt="" style={{ maxWidth: 200, borderRadius: 10 }} />)}
    <div className="av-row">
      <input type="file" accept={kind === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/jpeg,image/png,image/webp'} onChange={e => { const f = e.currentTarget.files?.[0]; if (f) upload(f) }} aria-label={kind === 'video' ? 'Subir video' : 'Subir imagen'} />
      {value && kind === 'image' && <button type="button" className="link" onClick={() => onChange(null)}>Quitar</button>}
    </div>
    {pct !== null && <progress max={100} value={pct} style={{ width: '100%' }}>{pct}%</progress>}
    {err && <p className="err">{err}</p>}
  </div>
}

export function StoryEditor({ id, slug, published: pub0, cloud, initial }: { id: string; slug: string; published: boolean; cloud: string; initial: Data }) {
  const [d, setD] = useState<Data>(initial)
  const [published, setPublished] = useState(pub0)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [seq, setSeq] = useState(0)
  const set = (patch: Partial<Data>) => setD(x => ({ ...x, ...patch }))
  const setScene = (i: number, patch: Partial<Scene>) => set({ scenes: d.scenes.map((s, j) => j === i ? { ...s, ...patch } : s) })
  const move = (i: number, by: number) => { const s = [...d.scenes]; const [x] = s.splice(i, 1); s.splice(i + by, 0, x); set({ scenes: s }) }
  const remove = (i: number) => {
    const gone = d.scenes[i].id
    set({ scenes: d.scenes.filter((_, j) => j !== i).map(s => ({ ...s, next: s.next === gone ? null : s.next, choices: s.choices.filter(c => c.next !== gone) })) })
  }
  const add = () => { setSeq(n => n + 1); set({ scenes: [...d.scenes, { id: `n${Date.now()}-${seq}`, title: '', video: '', description: '', image: null, next: null, ending: false, choices: [] }] }) }
  const name = (sid: string) => { const i = d.scenes.findIndex(s => s.id === sid); return `${i + 1}. ${d.scenes[i]?.title || 'Sin título'}` }

  async function save(): Promise<Result | null> {
    setBusy(true)
    const r = await fetch(`/api/admin/aventuras/historias/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()).catch(() => ({ errors: ['No se pudo guardar. Revisa tu conexión.'], warnings: [] }))
    setBusy(false); setResult(r)
    if (r.unpublished) setPublished(false)
    if (r.scenes) set({ scenes: r.scenes }) // ids reales: el próximo guardado no duplica capítulos
    return r
  }
  async function publish(action: 'publish' | 'unpublish') {
    if (action === 'publish' && !('warnings' in (await save() ?? {}))) return // datos inválidos: ni se guardó
    setBusy(true)
    const r = await fetch(`/api/admin/aventuras/historias/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }).then(r => r.json())
    setBusy(false); setResult(r); setPublished(r.published)
  }

  return <div>
    <div className="av-row"><span className={`av-badge${published ? ' on' : ''}`}>{published ? 'Publicada' : 'Borrador'}</span>
      <a href={`/aventuras/${slug}?preview=1`} target="_blank" rel="noopener">Vista previa ↗</a></div>
    {result && <>
      {result.unpublished && <p className="av-errs">La historia tenía errores y se despublicó para que ningún niño se quede atascado.</p>}
      {!!result.errors?.length && <ul className="av-errs">{result.errors.map(e => <li key={e}>{e}</li>)}</ul>}
      {!!result.warnings?.length && <ul className="av-warns">{result.warnings.map(e => <li key={e}>{e}</li>)}</ul>}
      {!result.errors?.length && <p className="ok">{result.published ? '¡Publicada!' : 'Guardado.'}</p>}
    </>}

    <section className="av-card">
      <h3>Datos generales</h3>
      <label htmlFor="t">Título *</label><input id="t" value={d.title} onChange={e => set({ title: e.target.value })} maxLength={160} />
      <label htmlFor="ds">Descripción *</label><textarea id="ds" value={d.description} onChange={e => set({ description: e.target.value })} rows={2} maxLength={600} />
      <label htmlFor="mi">Duración (minutos)</label><input id="mi" type="number" min={1} max={60} value={d.minutes} onChange={e => set({ minutes: Number(e.target.value) })} />
      <details><summary>Misión de pintura</summary>
        <label htmlFor="mt">Título</label><input id="mt" value={d.mission.title} onChange={e => set({ mission: { ...d.mission, title: e.target.value } })} placeholder="¡Ahora empieza tu misión!" />
        <label htmlFor="mx">Texto</label><textarea id="mx" value={d.mission.text} onChange={e => set({ mission: { ...d.mission, text: e.target.value } })} rows={2} />
        <label htmlFor="mtips">Consejos (uno por línea)</label><textarea id="mtips" value={d.mission.tips.join('\n')} onChange={e => set({ mission: { ...d.mission, tips: e.target.value.split('\n').slice(0, 8) } })} rows={3} />
      </details>
    </section>

    <h2>Capítulos</h2>
    {!d.scenes.length && <p className="tag">Aún no hay capítulos. Agrega el primero: solo necesitas título y video.</p>}
    {d.scenes.map((s, i) => <section className="av-card" key={s.id} aria-label={`Capítulo ${i + 1}`}>
      <div className="av-row" style={{ justifyContent: 'space-between' }}><h3>Capítulo {i + 1}{i === 0 && ' (inicio)'}</h3>
        <div className="av-row"><button type="button" className="link" disabled={i === 0} onClick={() => move(i, -1)}>↑ Subir</button>
          <button type="button" className="link" disabled={i === d.scenes.length - 1} onClick={() => move(i, 1)}>↓ Bajar</button>
          <button type="button" className="link" onClick={() => remove(i)}>Borrar</button></div></div>
      <label htmlFor={`st${i}`}>Título *</label><input id={`st${i}`} value={s.title} onChange={e => setScene(i, { title: e.target.value })} maxLength={160} />
      <label>Video *</label><CloudUpload kind="video" value={s.video} onChange={v => setScene(i, { video: v ?? '' })} slug={slug} cloud={cloud} />
      <details><summary>Opcional: descripción, imagen, decisiones, siguiente, final</summary>
        <label htmlFor={`sd${i}`}>Descripción (se muestra como texto bajo el video)</label><textarea id={`sd${i}`} value={s.description ?? ''} onChange={e => setScene(i, { description: e.target.value })} rows={2} />
        <label>Imagen (portada del video)</label><CloudUpload kind="image" value={s.image} onChange={v => setScene(i, { image: v })} slug={slug} cloud={cloud} />
        <label>Decisiones (0, 2 o 3 opciones)</label>
        {s.choices.map((c, j) => <div className="av-row" key={j}>
          <input aria-label={`Texto de la opción ${j + 1}`} value={c.label} placeholder="Ej. Entrar al bosque" onChange={e => setScene(i, { choices: s.choices.map((x, k) => k === j ? { ...x, label: e.target.value } : x) })} style={{ flex: 1 }} />
          <select aria-label={`Destino de la opción ${j + 1}`} value={c.next} onChange={e => setScene(i, { choices: s.choices.map((x, k) => k === j ? { ...x, next: e.target.value } : x) })} style={{ flex: 1 }}>
            {d.scenes.filter(x => x.id !== s.id).map(x => <option key={x.id} value={x.id}>{name(x.id)}</option>)}</select>
          <button type="button" className="link" onClick={() => setScene(i, { choices: s.choices.filter((_, k) => k !== j) })}>Quitar</button></div>)}
        {s.choices.length < 3 && d.scenes.length > 1 && <button type="button" className="btn ghost" onClick={() => setScene(i, { choices: [...s.choices, { label: '', next: d.scenes.find(x => x.id !== s.id)!.id }] })}>+ Agregar opción</button>}
        {!s.choices.length && <><label htmlFor={`sn${i}`}>Capítulo siguiente (si no, sigue el orden de la lista)</label>
          <select id={`sn${i}`} value={s.next ?? ''} onChange={e => setScene(i, { next: e.target.value || null })}><option value="">Siguiente de la lista</option>
            {d.scenes.filter(x => x.id !== s.id).map(x => <option key={x.id} value={x.id}>{name(x.id)}</option>)}</select>
          <label className="check"><input type="checkbox" checked={s.ending} onChange={e => setScene(i, { ending: e.target.checked })} /> Es un final (después va la misión de pintura)</label></>}
      </details>
    </section>)}
    <button type="button" className="btn ghost" onClick={add}>+ Agregar capítulo</button>
    <div className="av-row" style={{ position: 'sticky', bottom: 0, background: 'var(--cream)', padding: '10px 0' }}>
      <button type="button" onClick={save} disabled={busy}>Guardar</button>
      {published ? <button type="button" className="btn ghost" onClick={() => publish('unpublish')} disabled={busy}>Despublicar</button>
        : <button type="button" className="btn ghost" onClick={() => publish('publish')} disabled={busy}>Validar y publicar</button>}
    </div>
  </div>
}
