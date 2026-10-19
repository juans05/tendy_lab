import { createHash } from 'node:crypto'

// Cloudinary sin SDK: solo para contenido de TendyPeru (videos e imágenes de capítulos). Nunca fotos de niños.
// Firma = SHA-1 de los parámetros ordenados "k=v&k=v" + secreto (documentación de subidas firmadas).
export function signParams(params: Record<string, string | number>, secret: string): string {
  const s = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(s + secret).digest('hex')
}

export function uploadSignature(folder: string) {
  const timestamp = Math.floor(Date.now() / 1000)
  return {
    timestamp, folder, signature: signParams({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET ?? ''),
    api_key: process.env.CLOUDINARY_API_KEY ?? '', cloud: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  }
}

const base = (kind: 'video' | 'image') => `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${kind}/upload`
// 720 px y calidad automática: carga rápido con datos móviles y cuida los créditos del plan gratis.
export const videoUrl = (publicId: string) => `${base('video')}/q_auto,f_auto,w_720/${publicId}`
export const imageUrl = (publicId: string, w = 720) => `${base('image')}/q_auto,f_auto,w_${w}/${publicId}`
