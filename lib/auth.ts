import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { q } from './db'

const sha = (s: string) => createHash('sha256').update(s).digest('hex')

export function hashPass(pw: string) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pw, salt, 64).toString('hex')}`
}
export function checkPass(pw: string, stored: string) {
  const [salt, h] = stored.split(':')
  const a = Buffer.from(h, 'hex'), b = scryptSync(pw, salt, 64)
  return a.length === b.length && timingSafeEqual(a, b)
}

export type User = { id: string; email: string; is_admin: boolean; brand: Record<string, string> }

export async function startSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  await q(`insert into sessions(token_hash,user_id,expires_at) values($1,$2,now()+interval '30 days')`, [sha(token), userId])
  ;(await cookies()).set('sid', token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 30 * 86400,
  })
}
export async function endSession() {
  const c = await cookies()
  const t = c.get('sid')?.value
  if (t) await q('delete from sessions where token_hash=$1', [sha(t)])
  c.delete('sid')
}
export async function currentUser(): Promise<User | null> {
  const t = (await cookies()).get('sid')?.value
  if (!t) return null
  const r = await q<User>(
    `select u.id,u.email,u.is_admin,u.brand from sessions s join users u on u.id=s.user_id
     where s.token_hash=$1 and s.expires_at>now()`, [sha(t)])
  return r[0] ?? null
}
export async function requireUser() {
  const u = await currentUser()
  if (!u) redirect('/login')
  return u
}
export async function requireAdmin() {
  const u = await requireUser()
  if (!u.is_admin) redirect('/panel')
  return u
}
export const go = (path: string) => new Response(null, { status: 303, headers: { Location: path } })
