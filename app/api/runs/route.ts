import { ImageBrief, MAX_REFS } from '@/lib/image-brief'
import { imageAIReady } from '@/lib/image-ai'
import { OBJECTIVES, PLATFORMS } from '@/lib/meta'
import { socialUrl } from '@/lib/social-download'
import { z } from 'zod'
import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'
import { COST, type Tool } from '@/lib/credits'
import { createRun, FreeLimit, NoCredits } from '@/lib/runs'
import { profit, suggestedPrice } from '@/lib/profit'
import { ASPECTS, LOOKS, MAX_ANGLES, MIN_ANGLES } from '@/lib/product3d'

const MB = 1024 * 1024
const LIMITS = { image: 10 * MB, video: 100 * MB } // ponytail: video 100 MB (bytea); el funcional pide 200 MB con R2

function sniffImage(b: Buffer) {
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg'
  if (b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png'
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return 'image/webp'
  return null
}
// ftyp (mp4/mov) o EBML (webm); la validación real la hace ffprobe en el worker.
const sniffVideo = (b: Buffer) =>
  b.subarray(4, 8).toString() === 'ftyp' ? 'video/mp4' : b.subarray(0, 4).toString('hex') === '1a45dfa3' ? 'video/webm' : null

// Valida (tamaño + firma real del archivo) y guarda; devuelve los ids o el código de error para ?e=
async function saveUploads(userId: string, files: File[], video: boolean, max: number, min = 1): Promise<string[] | string> {
  if (files.length < min || files.length > max) return 'files'
  const bufs: { mime: string; name: string; data: Buffer }[] = []
  for (const file of files) {
    if (file.size > (video ? LIMITS.video : LIMITS.image)) return 'size'
    const data = Buffer.from(await file.arrayBuffer())
    const mime = video ? sniffVideo(data) : sniffImage(data)
    if (!mime) return 'type'
    bufs.push({ mime, name: file.name.slice(0, 120), data })
  }
  const ids: string[] = []
  for (const b of bufs) ids.push((await q<{ id: string }>('insert into assets(user_id,mime,name,data) values($1,$2,$3,$4) returning id', [userId, b.mime, b.name, b.data]))[0].id)
  return ids
}

const num = z.coerce.number().min(0).max(1e9)
const pctNum = z.coerce.number().min(0).max(100)
const ProfitForm = z.object({
  price: num.refine(v => v > 0), product_cost: num, ads_cost: num, packaging: num, delivery: num, other: num,
  fee_pct: pctNum, tax_pct: pctNum, target_margin_pct: pctNum,
})

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return go('/login')
  const f = await req.formData()
  const tool = String(f.get('tool')) as Tool
  if (!(tool in COST)) return go('/panel')
  const back = (e: string) => go(`/panel/tools/${tool === 'foto' ? 'imagen?modo=fondo&' : tool === 'video3d' ? 'imagen3d?modo=video&' : tool + '?'}e=${e}`) // foto y video3d viven como modos

  try {
    if (tool === 'profit') {
      const raw = Object.fromEntries([...f.entries()].map(([k, v]) => [k, v === '' ? 0 : v]))
      const suggest = f.get('mode') === 'suggest'
      const gain = num.safeParse(f.get('desired_gain'))
      if (suggest && (!gain.success || f.get('desired_gain') === null || f.get('desired_gain') === '')) return back('invalid')
      const p = ProfitForm.safeParse(suggest ? { ...raw, price: 1, target_margin_pct: 0 } : raw)
      if (!p.success) return back('invalid')
      const cents = (v: number) => Math.round(v * 100)
      const d = p.data
      if (suggest && (d.product_cost <= 0 || d.fee_pct + d.tax_pct >= 100)) return back('invalid')
      const desiredGain = suggest && gain.success ? cents(gain.data) : 0
      const price = suggest ? suggestedPrice(cents(d.product_cost) + cents(d.ads_cost) + cents(d.packaging) + cents(d.delivery) + cents(d.other), desiredGain, d.fee_pct, d.tax_pct) : cents(d.price)
      const result = profit({
        price, product_cost: cents(d.product_cost), ads_cost: cents(d.ads_cost), packaging: cents(d.packaging),
        delivery: cents(d.delivery), other: cents(d.other), fee_pct: d.fee_pct, tax_pct: d.tax_pct, target_margin_pct: d.target_margin_pct,
      })
      return go(`/panel/runs/${await createRun(user.id, 'profit', { currency: user.brand.currency || 'PEN', mode: suggest ? 'suggest' : 'check', desired_gain: desiredGain }, result)}`)
    }

    const files = f.getAll('files').filter((x): x is File => x instanceof File && x.size > 0)
    if (tool === 'imagen') {
      if (!imageAIReady()) return back('image_config')
      const brief = ImageBrief.safeParse(Object.fromEntries(f.entries()))
      if (!brief.success) return back('invalid')
      const ids = await saveUploads(user.id, files, false, MAX_REFS, 0)
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { brief: brief.data, brand: user.brand, assets: ids })}`)
    }
    if (tool === 'imagen3d' || tool === 'video3d') {
      const description = String(f.get('description') || '').trim(), look = String(f.get('look')), aspect = String(f.get('aspect'))
      if (!description || description.length > 2000 || !Object.hasOwn(LOOKS[tool], look) || !(ASPECTS[tool] as readonly string[]).includes(aspect)) return back('invalid')
      if (tool === 'imagen3d' ? !imageAIReady() : !process.env.GEMINI_API_KEY) return back(tool === 'imagen3d' ? 'image_config' : 'video_config')
      const ids = await saveUploads(user.id, files, false, MAX_ANGLES, MIN_ANGLES)
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { assets: ids, description, look, aspect, brand: user.brand })}`)
    }
    const description = String(f.get('description') || '').trim()
    const duration = Number(f.get('duration'))
    const style = String(f.get('style'))
    if (description.length > 2000 || (['guion', 'foto', 'whatsapp', 'copy'].includes(tool) && !description)) return back('invalid')
    if (tool === 'guion' && ![15, 30, 60].includes(duration)) return back('invalid')
    const request = String(f.get('request') || '').trim()
    if (tool === 'foto' && (!['catalogo', 'anuncio', 'libre'].includes(style) || request.length > 500 || (style === 'libre' && !request))) return back('invalid')
    if (tool === 'foto' && !imageAIReady()) return back('image_config')
    if (tool === 'transcribir' && !process.env.GEMINI_API_KEY) return back('audio_config')
    const objective = String(f.get('objective') ?? 'ventas')
    const platform = String(f.get('platform') ?? 'Multicanal')
    if (!OBJECTIVES.includes(objective) || !PLATFORMS.includes(platform)) return back('invalid')
    if (tool === 'whatsapp' || tool === 'copy') { // solo texto, sin archivos
      const extra = Object.fromEntries(['price', 'delivery', 'payment', 'hook'].map(k => [k, String(f.get(k) || '').trim()]))
      if (files.length || Object.values(extra).some(v => v.length > 500)) return back('invalid')
      return go(`/panel/runs/${await createRun(user.id, tool, { ...extra, description, objective, platform, brand: user.brand, assets: [] })}`)
    }
    const sourceUrl = String(f.get('source_url') || '').trim()
    if (tool === 'transcribir' && sourceUrl) {
      if (files.length) return back('invalid')
      let url: string
      try { url = socialUrl(sourceUrl) } catch { return back('url') }
      if (!process.env.YTDLP_PATH) return back('download_config')
      return go(`/panel/runs/${await createRun(user.id, tool, { source_url: url, assets: [], brand: user.brand, description, objective, platform })}`)
    }
    const isVideo = tool === 'video' || tool === 'transcribir'
    const ids = await saveUploads(user.id, files, isVideo, tool === 'hooks' ? 5 : 1)
    if (typeof ids === 'string') return back(ids)
    const id = await createRun(user.id, tool, { assets: ids, objective, platform, use_brand: true, brand: user.brand, description, ...(tool === 'guion' ? { duration } : tool === 'foto' ? { style, request } : {}) })
    return go(`/panel/runs/${id}`)
  } catch (e) {
    if (e instanceof NoCredits) return back('credits')
    if (e instanceof FreeLimit) return back('limit')
    console.error(e)
    return back('error')
  }
}
