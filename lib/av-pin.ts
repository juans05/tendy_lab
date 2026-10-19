import { randomInt } from 'node:crypto'

// PIN de 4 dígitos = 10.000 combinaciones: cada 5 fallos se bloquea 15 min; con 20 queda bloqueado hasta que el
// admin genere un PIN temporal. Los contadores viven en la BD para que un reinicio no los borre.
const FOREVER = new Date('9999-12-31T00:00:00Z')

export const pinLocked = (row: { pin_fails: number; locked_until: Date | null }, now: Date) =>
  !!row.locked_until && row.locked_until > now

export function afterFail(fails: number, now: Date): { pin_fails: number; locked_until: Date | null } {
  const n = fails + 1
  if (n >= 20) return { pin_fails: n, locked_until: FOREVER }
  return { pin_fails: n, locked_until: n % 5 === 0 ? new Date(now.getTime() + 15 * 60_000) : null }
}

// PIN fáciles de adivinar (los primeros que prueba cualquiera): repetidos, escaleras, años y pares "1212".
export function weakPin(pin: string) {
  const d = [...pin].map(Number), step = d[1] - d[0]
  return new Set(d).size === 1 || (Math.abs(step) === 1 && d.every((x, i) => !i || x - d[i - 1] === step))
    || /^(19|20)\d\d$/.test(pin) || (pin[0] === pin[2] && pin[1] === pin[3])
}

export function tempPin(): string {
  const pin = String(randomInt(10000)).padStart(4, '0')
  return weakPin(pin) ? tempPin() : pin
}
