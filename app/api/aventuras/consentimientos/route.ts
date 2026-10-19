import { z } from 'zod'
import { albumKit, revokeConsent } from '@/lib/av-album'

const Body = z.object({ media_id: z.string().uuid(), purpose: z.enum(['gallery', 'ads']) })

// Retirar un permiso opcional de una foto (galería o publicidad).
export async function POST(req: Request) {
  const kit = await albumKit()
  const b = Body.safeParse(await req.json().catch(() => null))
  if (!kit || !b.success) return new Response(null, { status: 404 })
  return await revokeConsent(kit.id, b.data.media_id, b.data.purpose) ? new Response(null, { status: 204 }) : new Response(null, { status: 404 })
}
