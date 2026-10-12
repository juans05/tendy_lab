import { q } from '@/lib/db'
import { go, hashPass, startSession } from '@/lib/auth'
import { SIGNUP_GRANT } from '@/lib/credits'

// ponytail: sin verificación de email ni límite por IP/dispositivo (funcional 7.5); añadir antes de abrir el Free al público.
export async function POST(req: Request) {
  const f = await req.formData()
  const email = String(f.get('email') ?? '').trim().toLowerCase()
  const pass = String(f.get('password') ?? '')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || pass.length < 8) return go('/register?e=invalid')
  const admin = !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase()
  const [u] = await q<{ id: string }>(
    'insert into users(email,pass,is_admin) values($1,$2,$3) on conflict(email) do nothing returning id', [email, hashPass(pass), admin])
  if (!u) return go('/register?e=exists')
  await q(`insert into ledger(user_id,type,amount,idem) values($1,'SIGNUP_GRANT',$2,$3)`, [u.id, SIGNUP_GRANT, `grant:${u.id}`])
  await startSession(u.id)
  return go('/panel')
}
