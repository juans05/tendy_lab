import { currentUser } from '@/lib/auth'
import { albumKit, deletePhoto, readPhoto } from '@/lib/av-album'

// Ninguna foto tiene URL pública: se descifra solo para la sesión de su kit o para un admin. Todo lo demás es 404.
const PRIVATE = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' }
const notFound = () => new Response(null, { status: 404, headers: PRIVATE })

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kit = await albumKit()
  const data = (kit && await readPhoto(id, kit.id)) || ((await currentUser())?.is_admin ? await readPhoto(id, null) : null)
  return data ? new Response(new Uint8Array(data), { headers: { ...PRIVATE, 'Content-Type': 'image/webp' } }) : notFound()
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const kit = await albumKit()
  return kit && await deletePhoto(kit.id, (await params).id) ? new Response(null, { status: 204 }) : notFound()
}
