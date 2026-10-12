import { q } from '@/lib/db'
import { checkPass, go, startSession } from '@/lib/auth'
import { loginAttempts } from '@/lib/login-guard'

export async function POST(req: Request) {
  const f = await req.formData()
  const email = String(f.get('email') ?? '').trim().toLowerCase()
  if (loginAttempts.blocked(email)) return go('/login?e=locked')
  const [u] = await q<{ id: string; pass: string }>('select id,pass from users where email=$1', [email])
  if (!u || !checkPass(String(f.get('password') ?? ''), u.pass)) { loginAttempts.fail(email); return go('/login?e=1') }
  loginAttempts.ok(email)
  await startSession(u.id)
  return go('/panel')
}
