import { q } from '@/lib/db'
import { normalizeCode } from '@/lib/av-codes'
import { adminUser } from '@/lib/av-audit'
import { adventureUrl, kitUrl, qrPng, qrSvg } from '@/lib/av-admin'

// QR de un kit (/k/CODE) o general de una aventura (a-<slug>), en PNG o SVG.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!await adminUser()) return new Response(null, { status: 404 })
  const raw = decodeURIComponent((await params).code)
  const svg = new URL(req.url).searchParams.get('format') === 'svg'
  let url: string, name: string
  if (raw.startsWith('a-')) {
    const slug = raw.slice(2)
    if (!/^[a-z0-9-]+$/.test(slug) || !(await q(`select 1 from adventures where slug=$1`, [slug])).length) return new Response(null, { status: 404 })
    url = adventureUrl(slug); name = `qr-${slug}`
  } else {
    const code = normalizeCode(raw)
    if (!code || !(await q(`select 1 from qr_codes where code=$1`, [code])).length) return new Response(null, { status: 404 })
    url = kitUrl(code); name = `qr-${code}`
  }
  const headers = { 'Content-Disposition': `attachment; filename="${name}.${svg ? 'svg' : 'png'}"`, 'Cache-Control': 'private, no-store' }
  return svg ? new Response(await qrSvg(url), { headers: { ...headers, 'Content-Type': 'image/svg+xml' } })
    : new Response(new Uint8Array(await qrPng(url)), { headers: { ...headers, 'Content-Type': 'image/png' } })
}
