import { normalizeCode } from '@/lib/av-codes'
import { albumKit, listPhotos } from '@/lib/av-album'
import { AlbumActions, PinForm } from '@/lib/av-album-ui'
import '../aventuras.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mis fotos · Tendy Aventuras', robots: { index: false, follow: false } }

// Se entra escaneando el QR del kit (el código no está impreso): ?k=CODE + PIN.
export default async function MisFotos({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const code = normalizeCode((await searchParams).k ?? '')
  const kit = await albumKit()
  const open = kit && (!code || kit.code === code) ? kit : null
  if (!open) return <main className="av">
    <h1>Mis fotos</h1>
    {code ? <PinForm code={code} /> : <p className="av-note">Escanea el QR que viene dentro de tu kit para ver tus fotos.</p>}
    <p className="av-meta">¿Olvidaste tu PIN? <a href="https://wa.me/51907579197" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>.</p>
  </main>
  const photos = await listPhotos(open.id)
  return <main className="av">
    <h1>Mis fotos</h1>
    {photos.length ? <AlbumActions photos={photos.map(p => ({ id: p.id, date: new Date(p.created_at).toLocaleDateString('es-PE'), consents: p.consents }))} />
      : <p className="av-note">Aún no hay fotos guardadas en este kit.</p>}
    <a className="av-link" href="/aventuras/privacidad">Privacidad</a>
  </main>
}
