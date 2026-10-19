import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// Fotos de niños cifradas en reposo con AES-256-GCM: si se filtra la BD o un backup, solo hay bytes ilegibles.
// ponytail: una sola clave; agregar versión de clave cuando haga falta rotarla.
export type Sealed = { iv: Buffer; tag: Buffer; data: Buffer }

export function mediaKey(): Buffer | null {
  const k = Buffer.from(process.env.MEDIA_ENC_KEY ?? '', 'base64')
  return k.length === 32 ? k : null
}
function keyOrThrow(key?: Buffer) {
  const k = key ?? mediaKey()
  if (!k) throw new Error('MEDIA_ENC_KEY no configurada')
  return k
}

export function encrypt(data: Buffer, key?: Buffer): Sealed {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', keyOrThrow(key), iv)
  const out = Buffer.concat([c.update(data), c.final()])
  return { iv, tag: c.getAuthTag(), data: out }
}

export function decrypt(e: Sealed, key?: Buffer): Buffer {
  // Tag de 16 bytes exactos: GCM aceptaría uno recortado y eso facilita falsificar datos.
  const d = createDecipheriv('aes-256-gcm', keyOrThrow(key), e.iv, { authTagLength: 16 })
  d.setAuthTag(e.tag)
  return Buffer.concat([d.update(e.data), d.final()])
}
