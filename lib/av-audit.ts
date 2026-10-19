import { currentUser } from './auth'
import { q } from './db'

// Admin de Tendy Aventuras: las APIs responden 404 a quien no es admin (no revelan que existen).
export async function adminUser() {
  const u = await currentUser()
  return u?.is_admin ? u : null
}

export async function audit(userId: string, action: string, target: string) {
  await q(`insert into admin_audit(user_id,action,target) values($1,$2,$3)`, [userId, action, target.slice(0, 300)])
}

export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
