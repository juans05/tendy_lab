import { go } from '@/lib/auth'
import { q } from '@/lib/db'
import { adminUser, audit, slugify } from '@/lib/av-audit'

// Crear una aventura (sin capítulos). Colección y personaje se eligen o se crean con solo el nombre.
export async function POST(req: Request) {
  const u = await adminUser()
  if (!u) return new Response(null, { status: 404 })
  const f = await req.formData()
  const title = String(f.get('title') ?? '').trim().slice(0, 160)
  const slug = slugify(String(f.get('slug') || title))
  if (!title || !slug || ['mis-fotos', 'privacidad'].includes(slug)) return go('/admin/aventuras/historias?e=datos')
  const newCol = String(f.get('new_collection') ?? '').trim().slice(0, 80)
  const newChar = String(f.get('new_character') ?? '').trim().slice(0, 80)
  let colId = String(f.get('collection_id') ?? '')
  if (newCol) colId = (await q(`insert into collections(slug,name) values($1,$2) on conflict (slug) do update set name=excluded.name returning id`, [slugify(newCol), newCol]))[0].id
  if (!/^\d+$/.test(colId)) return go('/admin/aventuras/historias?e=coleccion')
  let charId: string | null = String(f.get('character_id') ?? '') || null
  if (newChar) charId = (await q(`insert into characters(collection_id,slug,name) values($1,$2,$3) on conflict (slug) do update set name=excluded.name returning id`, [colId, slugify(newChar), newChar]))[0].id
  const r = await q(`insert into adventures(slug,collection_id,character_id,title,description) values($1,$2,$3,$4,$5) on conflict (slug) do nothing returning id`,
    [slug, colId, charId && /^\d+$/.test(charId) ? charId : null, title, String(f.get('description') ?? '').trim().slice(0, 600) || title])
  if (!r.length) return go('/admin/aventuras/historias?e=slug')
  await audit(u.id, 'adventure.create', slug)
  return go(`/admin/aventuras/historias/${r[0].id}`)
}
