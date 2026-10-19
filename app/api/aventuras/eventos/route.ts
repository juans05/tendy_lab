import { z } from 'zod'
import { q } from '@/lib/db'
import { normalizeCode } from '@/lib/av-codes'
import { loginGuard } from '@/lib/login-guard'

// Conteos anónimos (sin IP ni navegador guardados). El límite por IP solo vive en memoria.
const g = globalThis as any
const limit: ReturnType<typeof loginGuard> = (g.__avEvents ??= loginGuard(60, 60_000))
const Body = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(80), type: z.enum(['start', 'complete', 'diploma', 'whatsapp']), k: z.string().max(20).optional() })

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',').pop()!.trim()
  if (limit.blocked(ip)) return new Response(null, { status: 429 })
  limit.fail(ip)
  const body = Body.safeParse(await req.json().catch(() => null))
  if (!body.success) return new Response(null, { status: 400 })
  const code = body.data.k ? normalizeCode(body.data.k) : null
  await q(`insert into adventure_events(adventure_id,qr_code_id,type)
    select a.id,(select id from qr_codes where code=$2),$3 from adventures a where a.slug=$1`, [body.data.slug, code, body.data.type])
  return new Response(null, { status: 204 })
}
