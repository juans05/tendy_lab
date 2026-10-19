import sharp from 'sharp'

// Re-codificar en el servidor: elimina EXIF/GPS (la ubicación de la casa) y cualquier contenido escondido.
// No se confía en la extensión ni en el Content-Type: sharp tiene que decodificar una imagen real.
export async function sanitizeImage(input: Buffer, maxBytes: number): Promise<Buffer> {
  if (!input.length || input.length > maxBytes) throw new Error('tamaño')
  const img = sharp(input, { limitInputPixels: 40_000_000, failOn: 'error' })
  const meta = await img.metadata().catch(() => null)
  if (!meta || !['jpeg', 'png', 'webp'].includes(meta.format ?? '')) throw new Error('formato')
  return img.rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
}
