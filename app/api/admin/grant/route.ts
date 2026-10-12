import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'

// Sin pasarela de pago en el MVP de 3 días: el admin asigna monedas a mano (ledger ADMIN_ADJUST, auditable).
export async function POST(req: Request) {
  const admin = await currentUser()
  if (!admin?.is_admin) return go('/panel')
  const f = await req.formData()
  const credits = Number(f.get('credits'))
  if (!Number.isFinite(credits) || credits === 0 || Math.abs(credits) > 10000) return go('/admin?e=invalid')
  const r = await q(
    `insert into ledger(user_id,type,amount,note) select id,'ADMIN_ADJUST',$2,$3 from users where email=$1 returning id`,
    [String(f.get('email')).trim().toLowerCase(), Math.round(credits * 10), `por ${admin.email}: ${String(f.get('note') ?? '').slice(0, 200)}`])
  return go(r.length ? '/admin?ok=1' : '/admin?e=nouser')
}
