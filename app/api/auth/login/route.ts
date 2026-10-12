import { q } from '@/lib/db'
import { checkPass, go, startSession } from '@/lib/auth'
import { attemptKey, emailAttempts, loginAttempts } from '@/lib/login-guard'

export async function POST(req: Request) {
  const f = await req.formData()
  const email = String(f.get('email') ?? '').trim().toLowerCase()
  const key = attemptKey(email, req.headers)
  if (loginAttempts.blocked(key) || emailAttempts.blocked(email)) return go('/login?e=locked')
  // El intento se cuenta ANTES del await: si no, muchas peticiones simultáneas pasarían el chequeo a la vez.
  loginAttempts.fail(key); emailAttempts.fail(email)
  const [u] = await q<{ id: string; pass: string }>('select id,pass from users where email=$1', [email])
  if (!u || !checkPass(String(f.get('password') ?? ''), u.pass)) return go('/login?e=1')
  loginAttempts.ok(key); emailAttempts.ok(email)
  await startSession(u.id)
  return go('/panel')
}
