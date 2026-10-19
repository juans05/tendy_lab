import { randomInt } from 'node:crypto'

// Código único por kit. Solo va dentro del QR, nunca impreso como texto. Sin 0/O/1/I para que nadie los confunda.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
export const CODE_RE = /^TP-[2-9A-HJ-NP-Z]{8}$/

export const newCode = () => 'TP-' + Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

export function normalizeCode(input: string): string | null {
  const s = input.toUpperCase().replace(/[\s-]/g, '')
  const code = s.startsWith('TP') ? `TP-${s.slice(2)}` : ''
  return CODE_RE.test(code) ? code : null
}
