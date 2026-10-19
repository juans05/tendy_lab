import { requireAdmin } from '@/lib/auth'
import { q } from '@/lib/db'

const ERR: Record<string, string> = { datos: 'Falta el título o el slug no es válido.', coleccion: 'Elige o crea una colección.', slug: 'Ya existe una aventura con ese slug.' }

export default async function Historias({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requireAdmin()
  const { e } = await searchParams
  const list = await q(`select a.id,a.slug,a.title,a.published,c.name as collection,(select count(*)::int from story_scenes s where s.adventure_id=a.id) as scenes
    from adventures a join collections c on c.id=a.collection_id order by a.id desc`)
  const cols = await q(`select id,name from collections where active order by name`)
  const chars = await q(`select id,name from characters where active order by name`)
  return <>
    {e && <div className="err">{ERR[e] ?? 'No se pudo crear.'}</div>}
    {list.map(a => <div className="av-card av-row" key={a.id}>
      <div style={{ flex: 1 }}><h3 style={{ margin: 0 }}><a href={`/admin/aventuras/historias/${a.id}`}>{a.title}</a></h3>
        <span className="av-small">/aventuras/{a.slug} · {a.collection} · {a.scenes} capítulo(s)</span></div>
      <span className={`av-badge${a.published ? ' on' : ''}`}>{a.published ? 'Publicada' : 'Borrador'}</span>
    </div>)}
    <form className="form" method="post" action="/api/admin/aventuras/historias">
      <h3>Nueva aventura</h3>
      <div className="row">
        <div><label htmlFor="title">Título *</label><input id="title" name="title" required maxLength={160} /></div>
        <div><label htmlFor="slug">Dirección (slug)</label><input id="slug" name="slug" pattern="[a-z0-9-]+" placeholder="se genera del título" /></div>
      </div>
      <label htmlFor="description">Descripción</label><textarea id="description" name="description" rows={2} maxLength={600} />
      <div className="row">
        <div><label htmlFor="collection_id">Colección</label><select id="collection_id" name="collection_id">{cols.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label htmlFor="new_collection">…o nueva colección</label><input id="new_collection" name="new_collection" placeholder="Ej. Tendy Navidad" /></div>
        <div><label htmlFor="character_id">Personaje</label><select id="character_id" name="character_id"><option value="">(ninguno)</option>{chars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label htmlFor="new_character">…o nuevo personaje</label><input id="new_character" name="new_character" placeholder="Ej. Renito" /></div>
      </div>
      <button>Crear y agregar capítulos</button>
    </form>
  </>
}
