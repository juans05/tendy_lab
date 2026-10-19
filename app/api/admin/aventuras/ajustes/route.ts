import { z } from 'zod'
import { go } from '@/lib/auth'
import { adminUser, audit } from '@/lib/av-audit'
import { saveSettings } from '@/lib/av-settings'

const Form = z.object({
  uploads_enabled: z.boolean(), max_photo_mb: z.coerce.number().int().min(1).max(20),
  max_photos_per_kit: z.coerce.number().int().min(1).max(3), retention_days: z.coerce.number().int().min(30).max(1825),
  consent_version: z.string().trim().min(1).max(40), kits_url: z.string().trim().url().max(300),
})

export async function POST(req: Request) {
  const u = await adminUser()
  if (!u) return new Response(null, { status: 404 })
  const f = Object.fromEntries(await req.formData())
  const r = Form.safeParse({ ...f, uploads_enabled: f.uploads_enabled === 'on' })
  if (!r.success) return go('/admin/aventuras/ajustes?e=1')
  await saveSettings(r.data)
  await audit(u.id, 'settings.save', JSON.stringify(r.data))
  return go('/admin/aventuras/ajustes?ok=1')
}
