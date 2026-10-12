import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'
import { BRAND_FIELDS } from '@/lib/brand-options'

// Valores marcados (solo de la lista) + los que el usuario escribió, unidos con ", ".
export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return go('/login')
  const f = await req.formData()
  const brand: Record<string, string> = { name: String(f.get('name') ?? '').trim().slice(0, 100) }
  for (const [k, { options, single }] of Object.entries(BRAND_FIELDS)) {
    const allowed = new Set(options.map(o => o.value))
    const picked = f.getAll(k).map(String).filter(v => allowed.has(v))
    const extra = String(f.get(`${k}_extra`) ?? '').split(',').map(s => s.trim().replace(/\s+/g, ' ').slice(0, 60)).filter(Boolean).slice(0, 10)
    const all = [...new Set([...picked, ...extra])]
    brand[k] = (single ? all.slice(0, 1) : all).join(', ')
  }
  brand.palette = String(f.get('palette') ?? '').trim().slice(0, 250)
  brand.typography = String(f.get('typography') ?? '').trim().slice(0, 250)
  await q('update users set brand=$2 where id=$1', [user.id, brand])
  return go('/panel/brand?ok=1')
}
