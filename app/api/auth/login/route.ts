import { q } from '@/lib/db'
import { checkPass, go, startSession } from '@/lib/auth'
import { attemptKey, loginAttempts } from '@/lib/login-guard'

export async function POST(req: Request) {
  const f = await req.formData()
  const email = String(f.get('email') ?? '').trim().toLowerCase()
  const key = attemptKey(email, req.headers)
  if (loginAttempts.blocked(key)) return go('/login?e=locked')
  const [u] = await q<{ id: string; pass: string }>('select id,pass from users where email=$1', [email])
  if (!u || !checkPass(String(f.get('password') ?? ''), u.pass)) { loginAttempts.fail(key); return go('/login?e=1') }
  loginAttempts.ok(key)
  await startSession(u.id)
  return go('/panel')
}
