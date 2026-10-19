import { go } from '@/lib/auth'
import { q } from '@/lib/db'
import { adminUser, audit } from '@/lib/av-audit'
import { moderate } from '@/lib/av-admin'

// Moderación: aprobar (solo con permiso de galería vigente), rechazar o borrar.
export async function POST(req: Request) {
  const u = await adminUser()
  if (!u) return new Response(null, { status: 404 })
  const f = await req.formData()
  const id = String(f.get('id') ?? ''), action = String(f.get('action') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(id)) return go('/admin/aventuras/fotos?e=1')
  let ok = false
  if (action === 'approved' || action === 'rejected') ok = await moderate(id, action)
  if (action === 'delete') ok = (await q(`delete from media_files where id=$1 returning id`, [id])).length > 0
  if (ok) await audit(u.id, `media.${action}`, id)
  return go(`/admin/aventuras/fotos?${ok ? 'ok=1' : action === 'approved' ? 'e=permiso' : 'e=1'}`)
}
