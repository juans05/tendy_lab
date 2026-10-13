import { ImageBrief, MAX_REFS, TWEAKS, type Tweak } from '@/lib/image-brief'
import { imageAIReady } from '@/lib/image-ai'
import { OBJECTIVES, PLATFORMS, PROMPT_TARGETS } from '@/lib/meta'
import { socialUrl } from '@/lib/social-download'
import { z } from 'zod'
import { currentUser, go } from '@/lib/auth'
import { q } from '@/lib/db'
import { COST, type Tool } from '@/lib/credits'
import { createRun, FreeLimit, NoCredits } from '@/lib/runs'
import { profit, suggestedPrice } from '@/lib/profit'
import { ASPECTS, LOOKS, MAX_ANGLES, MIN_ANGLES } from '@/lib/product3d'
import { wantsCutout } from '@/lib/cutout'
import { isPhotoStyle } from '@/lib/photo-ai'
import { BACKDROPS, MAX_COVER_WORDS, PORTRAIT_LOOKS, words } from '@/lib/portrait'
import { HEX } from '@/lib/landing-prompt'

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

// Colores de marca para la Página de producto: solo #rrggbb válidos; si no vienen, la página usa los de Tendy.
const hexColors = (f: FormData) => Object.fromEntries((['color_primary', 'color_accent'] as const).map(k => [k, String(f.get(k) || '')]).filter(([, v]) => HEX.test(v)))
const num = z.coerce.number().min(0).max(1e9)
const pctNum = z.coerce.number().min(0).max(100)
const ProfitForm = z.object({
  price: num.refine(v => v > 0), product_cost: num, ads_cost: num, packaging: num, delivery: num, other: num,
  fee_pct: pctNum, tax_pct: pctNum, target_margin_pct: pctNum,
})

// Ficha visual del producto elegido (Mi ruta) para Foto, Imagen y 3D; vacío si no eligió o no tiene ficha.
async function visualSpec(userId: string, f: FormData) {
  const id = String(f.get('product_id') || '')
  if (!/^\d+$/.test(id)) return ''
  const [p] = await q<{ spec: string | null }>(`select data->>'visual_spec' spec from products where id=$1 and user_id=$2`, [id, userId])
  return p?.spec?.slice(0, 1500) || ''
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return go('/login')
  const f = await req.formData()
  const tool = String(f.get('tool')) as Tool
  if (!(tool in COST) || tool === 'landingpro') return go('/panel')
  const back = (e: string) => go(`/panel/tools/${tool === 'foto' ? 'imagen?modo=fondo&' : tool === 'retrato' ? 'imagen?modo=retrato&' : tool === 'video3d' ? 'imagen3d?modo=video&' : tool + '?'}e=${e}`) // foto y video3d viven como modos

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
    if (tool === 'imagen' && f.get('from_run')) { // Cambiar una sola cosa de una imagen ya generada
      if (!imageAIReady()) return back('image_config')
      const from = String(f.get('from_run')), change = String(f.get('change') || '').trim(), kind = String(f.get('kind') || 'libre'), rebase = f.get('rebase') === '1'
      const [prev] = /^\d+$/.test(from) ? await q(`select tool,input,result from runs where id=$1 and user_id=$2 and status='COMPLETED' and tool = any($3)`, [from, user.id, ['imagen', 'foto', 'retrato', 'imagen3d']]) : []
      if (!prev?.result?.asset_id) return back('invalid')
      // Cadena de ajustes: la imagen raíz y los cambios acumulados viajan de un ajuste al siguiente.
      const done: Tweak[] = prev.result.changes ?? []
      if (rebase ? done.length < 2 : !Object.hasOwn(TWEAKS, kind) || change.length < 3 || change.length > 300) return back('invalid')
      const all = rebase ? done : [...done, { kind, change }].slice(-10)
      const rootAsset = String(prev.result.root_asset_id ?? prev.result.asset_id)
      const format = prev.input.brief?.format
      const aspect = prev.tool === 'imagen' ? (prev.input.aspect ?? (format === 'A4' ? '3:4' : format)) : prev.tool === 'retrato' ? PORTRAIT_LOOKS[prev.input.look as keyof typeof PORTRAIT_LOOKS][1] : prev.input.aspect
      return go(`/panel/runs/${await createRun(user.id, tool, { changes: rebase ? all : [{ kind, change }], all_changes: all, rebase, root_asset_id: rootAsset, base_prompt: prev.result.base_prompt ?? prev.result.prompt ?? '', aspect, from_run: from, brand: user.brand, assets: [rebase ? rootAsset : String(prev.result.asset_id)] })}`)
    }
    if (tool === 'retrato') {
      if (!imageAIReady()) return back('image_config')
      const look = String(f.get('look')), backdrop = String(f.get('backdrop')), outfit = String(f.get('outfit') || '').trim()
      const title = String(f.get('title') || '').trim(), cover_line = String(f.get('cover_line') || '').trim()
      if (f.get('consent') !== 'on' || !Object.hasOwn(PORTRAIT_LOOKS, look) || !Object.hasOwn(BACKDROPS, backdrop) || outfit.length > 200) return back('invalid')
      if (look === 'portada' && (!title || title.length > 30 || words(title) > MAX_COVER_WORDS || cover_line.length > 40 || words(cover_line) > MAX_COVER_WORDS)) return back('invalid')
      const ids = await saveUploads(user.id, files, false, MAX_REFS, 1)
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { look, backdrop, outfit, ...(look === 'portada' ? { title, cover_line } : {}), consent: true, brand: user.brand, assets: ids })}`)
    }
    if (tool === 'imagen') {
      if (!imageAIReady()) return back('image_config')
      const brief = ImageBrief.safeParse(Object.fromEntries(f.entries()))
      if (!brief.success) return back('invalid')
      const ids = await saveUploads(user.id, files, false, MAX_REFS, 0)
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { brief: brief.data, brand: user.brand, assets: ids, visual_spec: await visualSpec(user.id, f) })}`)
    }
    if (tool === 'imagen3d' || tool === 'video3d') {
      const description = String(f.get('description') || '').trim(), look = String(f.get('look')), aspect = String(f.get('aspect'))
      if (!description || description.length > 2000 || !Object.hasOwn(LOOKS[tool], look) || !(ASPECTS[tool] as readonly string[]).includes(aspect)) return back('invalid')
      if (tool === 'imagen3d' ? !imageAIReady() : !process.env.GEMINI_API_KEY) return back(tool === 'imagen3d' ? 'image_config' : 'video_config')
      const ids = await saveUploads(user.id, files, false, MAX_ANGLES, MIN_ANGLES)
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { assets: ids, description, look, aspect, brand: user.brand, visual_spec: await visualSpec(user.id, f) })}`)
    }
    if (tool === 'ficha') {
      const productId = String(f.get('product_id') || ''), description = String(f.get('description') || '').trim()
      const [p] = /^\d+$/.test(productId) ? await q<{ name: string }>('select name from products where id=$1 and user_id=$2', [productId, user.id]) : []
      if (!p || description.length > 1000) return go('/panel/products?error=1')
      const ids = await saveUploads(user.id, files, false, 1)
      if (typeof ids === 'string') return go(`/panel/products/${productId}?error=1`)
      return go(`/panel/runs/${await createRun(user.id, tool, { product_id: productId, product_name: p.name, description, brand: user.brand, assets: ids })}`)
    }
    if (tool === 'prompt') {
      const description = String(f.get('description') || '').trim(), target = String(f.get('target'))
      const copy = target === 'copiar' // copiar: la imagen de referencia es obligatoria y la idea, opcional
      if ((!description && !copy) || description.length > 2000 || !Object.hasOwn(PROMPT_TARGETS, target) || (!copy && files.length)) return back('invalid')
      const ids = copy ? await saveUploads(user.id, files, false, 1) : []
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { description, target, brand: user.brand, assets: ids })}`)
    }
    if (tool === 'landing') {
      if (!user.brand.name || !user.brand.currency) return back('brand')
      const description = String(f.get('description') || '').trim(), priceText = String(f.get('price') || '').trim()
      const price = Number(priceText), whatsapp = String(f.get('whatsapp') || '').replace(/\D/g, '')
      if (!description || description.length > 2000 || !(price > 0 && price <= 1e6) || (whatsapp && (whatsapp.length < 8 || whatsapp.length > 15))) return back('invalid')
      const ids = await saveUploads(user.id, files, false, 5)
      if (typeof ids === 'string') return back(ids)
      return go(`/panel/runs/${await createRun(user.id, tool, { description, price: Math.round(price * 100), price_text: priceText, currency: user.brand.currency, whatsapp, colors: hexColors(f), brand: user.brand, assets: ids })}`)
    }
    const description = String(f.get('description') || '').trim()
    const duration = Number(f.get('duration'))
    const style = String(f.get('style'))
    if (description.length > 2000 || (['guion', 'foto', 'whatsapp', 'copy'].includes(tool) && !description && style !== 'sinfondo')) return back('invalid')
    if (tool === 'guion' && ![15, 30, 60].includes(duration)) return back('invalid')
    const request = String(f.get('request') || '').trim()
    if (tool === 'foto' && (!isPhotoStyle(style) || request.length > 500 || (style === 'libre' && !request))) return back('invalid')
    if (tool === 'foto' && !wantsCutout(style, request) && !imageAIReady()) return back('image_config') // el recorte no usa proveedor de IA
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
    const id = await createRun(user.id, tool, { assets: ids, objective, platform, use_brand: true, brand: user.brand, description, ...(tool === 'guion' ? { duration } : tool === 'foto' ? { style, request, visual_spec: await visualSpec(user.id, f) } : {}) })
    return go(`/panel/runs/${id}`)
  } catch (e) {
    if (e instanceof NoCredits) return back('credits')
    if (e instanceof FreeLimit) return back('limit')
    console.error(e)
    return back('error')
  }
}
