// Límite de intentos de login por correo (fuerza bruta).
// ponytail: en memoria del proceso (web y worker son uno solo); si se escala a varias instancias, moverlo a Postgres.
export function loginGuard(max: number, windowMs: number) {
  const fails = new Map<string, number[]>()
  const key = (email: string) => email.trim().toLowerCase()
  const recent = (email: string, now: number) => (fails.get(key(email)) ?? []).filter(t => now - t < windowMs)
  return {
    blocked: (email: string, now = Date.now()) => recent(email, now).length >= max,
    fail: (email: string, now = Date.now()) => { fails.set(key(email), [...recent(email, now), now]) },
    ok: (email: string) => { fails.delete(key(email)) },
  }
}
// Clave correo + IP: los fallos de un atacante no bloquean al dueño de la cuenta desde su propia IP.
// Se toma la última IP de x-forwarded-for (la agrega el proxy de Railway; las primeras las puede inventar el cliente).
// ponytail: no frena fuerza bruta repartida en muchas IPs; añadir un tope global por correo si llega a pasar.
export const attemptKey = (email: string, headers: Headers) =>
  `${email}|${(headers.get('x-forwarded-for') ?? '').split(',').pop()!.trim()}`
const g = globalThis as any
export const loginAttempts: ReturnType<typeof loginGuard> = (g.__loginGuard ??= loginGuard(5, 15 * 60_000))
