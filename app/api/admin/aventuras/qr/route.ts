import { go } from '@/lib/auth'
import { q } from '@/lib/db'
import { normalizeCode } from '@/lib/av-codes'
import { adminUser, audit } from '@/lib/av-audit'
import { generateBatch, reassign, resetPin } from '@/lib/av-admin'

// Generar lote y reasignar (formularios). Reset de PIN responde JSON: el PIN temporal se muestra una vez y no viaja en la URL.
export async function POST(req: Request) {
  const u = await adminUser()
  if (!u) return new Response(null, { status: 404 })
  if (req.headers.get('content-type')?.includes('application/json')) {
    const code = normalizeCode(String((await req.json().catch(() => ({}))).code ?? ''))
    const pin = code && await resetPin(code)
    if (!pin) return Response.json({ error: 'Código no encontrado.' }, { status: 404 })
    await audit(u.id, 'qr.reset_pin', code!)
    return Response.json({ pin, code })
  }
  const f = await req.formData()
  const adventure = String(f.get('adventure_id') ?? '')
  if (!/^\d+$/.test(adventure) || !(await q(`select 1 from adventures where id=$1`, [adventure])).length) return go('/admin/aventuras/qr?e=aventura')
  if (f.get('action') === 'generate') {
    const batch = String(f.get('batch') ?? '').trim().slice(0, 60)
    const n = Number(f.get('n'))
    if (!batch || !Number.isInteger(n) || n < 1 || n > 1000) return go('/admin/aventuras/qr?e=lote')
    await generateBatch(adventure, batch, n)
    await audit(u.id, 'qr.generate', `${batch} x${n}`)
    return go(`/admin/aventuras/qr?ok=${encodeURIComponent(batch)}`)
  }
  if (f.get('action') === 'reassign') {
    const code = normalizeCode(String(f.get('code') ?? ''))
    const batch = String(f.get('batch') ?? '').trim()
    const n = code ? await reassign({ code }, adventure) : batch ? await reassign({ batch }, adventure) : 0
    await audit(u.id, 'qr.reassign', `${code ?? batch} -> ${adventure}`)
    return go(n ? `/admin/aventuras/qr?moved=${n}` : '/admin/aventuras/qr?e=nada')
  }
  return new Response(null, { status: 400 })
}
