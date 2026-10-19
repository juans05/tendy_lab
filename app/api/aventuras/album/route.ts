import { cookies } from 'next/headers'
import { z } from 'zod'
import { normalizeCode } from '@/lib/av-codes'
import { albumKit, deleteAll, startAlbumSession, verifyPin } from '@/lib/av-album'
import { loginGuard } from '@/lib/login-guard'

// Además del bloqueo por kit: tope por IP para que nadie pruebe PIN comunes en muchos kits.
const g = globalThis as any
const perIp: ReturnType<typeof loginGuard> = (g.__avPin ??= loginGuard(30, 15 * 60_000))

const Body = z.object({ k: z.string().max(20), pin: z.string().max(10) })

// Entrar a "Mis fotos" con el código del QR + PIN.
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',').pop()!.trim()
  if (perIp.blocked(ip)) return Response.json({ error: 'Demasiados intentos. Espera 15 minutos o escríbenos por WhatsApp.' }, { status: 429 })
  perIp.fail(ip)
  const b = Body.safeParse(await req.json().catch(() => null))
  const code = b.success ? normalizeCode(b.data.k) : null
  if (!b.success || !code) return Response.json({ error: 'Escanea el QR de tu kit.' }, { status: 400 })
  const v = await verifyPin(code, b.data.pin)
  if (v.status === 'ok') { await startAlbumSession(v.kitId!); return Response.json({ ok: true }) }
  const error = { locked: 'Demasiados intentos. Espera 15 minutos o escríbenos por WhatsApp.', nopin: 'Este kit todavía no tiene fotos guardadas.', nokit: 'Escanea el QR de tu kit.', bad: 'El PIN no es correcto.' }[v.status]
  return Response.json({ error }, { status: v.status === 'locked' ? 423 : 401 })
}

// Borrar todo: fotos, permisos, sesiones y PIN del kit.
export async function DELETE() {
  const kit = await albumKit()
  if (!kit) return new Response(null, { status: 404 })
  await deleteAll(kit.id)
  ;(await cookies()).delete('avs')
  return new Response(null, { status: 204 })
}
