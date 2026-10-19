import { q } from '@/lib/db'
import { adminUser, audit } from '@/lib/av-audit'
import { validateStory } from '@/lib/av-story'
import { loadStory, saveStory, StoryInput } from '@/lib/av-story-db'

type Ctx = { params: Promise<{ id: string }> }
const exists = async (id: string) => /^\d+$/.test(id) && (await q(`select 1 from adventures where id=$1`, [id])).length > 0

// Guardar datos generales + lista completa de capítulos.
export async function PUT(req: Request, { params }: Ctx) {
  const u = await adminUser(), { id } = await params
  if (!u || !await exists(id)) return new Response(null, { status: 404 })
  const body = StoryInput.safeParse(await req.json().catch(() => null))
  if (!body.success) return Response.json({ errors: ['Revisa los datos: ' + body.error.issues.map(i => i.path.join('.')).join(', ')] }, { status: 400 })
  const r = await saveStory(id, body.data)
  await audit(u.id, 'adventure.save', id)
  return Response.json({ ...r, scenes: (await loadStory(id)).scenes })
}

// Publicar (solo si la historia es válida) o despublicar.
export async function POST(req: Request, { params }: Ctx) {
  const u = await adminUser(), { id } = await params
  if (!u || !await exists(id)) return new Response(null, { status: 404 })
  const { action } = await req.json().catch(() => ({}))
  if (action === 'unpublish') {
    await q(`update adventures set published=false where id=$1`, [id])
    await audit(u.id, 'adventure.unpublish', id)
    return Response.json({ published: false, errors: [], warnings: [] })
  }
  if (action !== 'publish') return new Response(null, { status: 400 })
  const v = validateStory(await loadStory(id))
  if (!v.errors.length) { await q(`update adventures set published=true,updated_at=now() where id=$1`, [id]); await audit(u.id, 'adventure.publish', id) }
  return Response.json({ published: !v.errors.length, ...v })
}
