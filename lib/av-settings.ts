import { q } from './db'

// Ajustes de Tendy Aventuras que el admin cambia sin tocar código. Lo que no está en la tabla usa el valor por defecto.
export type AvSettings = {
  uploads_enabled: boolean; max_photo_mb: number; max_photos_per_kit: number
  retention_days: number; consent_version: string; kits_url: string
}
export const DEFAULTS: AvSettings = {
  uploads_enabled: true, max_photo_mb: 8, max_photos_per_kit: 3, retention_days: 365,
  consent_version: 'v1-2026-10', kits_url: 'https://tendyperu.com',
}

export async function getSettings(): Promise<AvSettings> {
  const rows = await q<{ key: keyof AvSettings; value: never }>('select key,value from av_settings')
  const s = { ...DEFAULTS }
  for (const r of rows) if (r.key in s) s[r.key] = r.value
  return s
}

export async function saveSettings(patch: Partial<AvSettings>) {
  for (const [k, v] of Object.entries(patch))
    await q(`insert into av_settings(key,value) values($1,$2) on conflict (key) do update set value=excluded.value`, [k, JSON.stringify(v)])
}
