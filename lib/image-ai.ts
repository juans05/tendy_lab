import sharp from 'sharp'

// Cadena de imágenes Gemini → OpenAI (entran las que tengan clave; orden en IMAGE_PROVIDERS).
// Devuelve WEBP; con `aspect` se recorta a esa proporción exacta.
type Img = { mime: string; data: Buffer }
type Req = { prompt: string; images?: Img[]; aspect?: string }

export function openaiSize(aspect?: string) {
  if (!aspect) return 'auto'
  const [w, h] = aspect.split(':').map(Number)
  return w === h ? '1024x1024' : h > w ? '1024x1536' : '1536x1024'
}

async function gemini({ prompt, images = [], aspect }: Req) {
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', signal: AbortSignal.timeout(240000), headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }, ...images.map(i => ({ inlineData: { mimeType: i.mime, data: i.data.toString('base64') } }))] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'], ...(aspect ? { imageConfig: { aspectRatio: aspect } } : {}) },
    }),
  })
  if (!res.ok) throw new Error(`gemini ${res.status} ${(await res.text()).slice(0, 200)}`)
  const b64 = (await res.json()).candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'))?.inlineData?.data
  if (!b64) throw new Error('gemini sin imagen')
  return Buffer.from(b64, 'base64')
}

async function openai({ prompt, images = [], aspect }: Req) {
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
  const headers = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  const opts = { model, prompt, size: openaiSize(aspect), n: '1' }
  let res: Response
  if (images.length) {
    const f = new FormData()
    for (const [k, v] of Object.entries(opts)) f.append(k, v)
    images.forEach((i, n) => f.append('image[]', new Blob([new Uint8Array(i.data)], { type: i.mime }), `ref-${n}.${i.mime.split('/')[1]}`))
    res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', signal: AbortSignal.timeout(240000), headers, body: f })
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST', signal: AbortSignal.timeout(240000), headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...opts, n: 1 }),
    })
  }
  if (!res.ok) throw new Error(`openai ${res.status} ${(await res.text()).slice(0, 200)}`)
  const b64 = (await res.json()).data?.[0]?.b64_json
  if (!b64) throw new Error('openai sin imagen')
  return Buffer.from(b64, 'base64')
}

const ALL: Record<string, [string | undefined, (r: Req) => Promise<Buffer>]> = {
  gemini: [process.env.GEMINI_API_KEY, gemini], openai: [process.env.OPENAI_API_KEY, openai],
}
const chain = () => (process.env.IMAGE_PROVIDERS || 'gemini,openai').split(',').flatMap(n => ALL[n.trim()]?.[0] ? [[n.trim(), ALL[n.trim()][1]] as const] : [])
export const imageAIReady = () => chain().length > 0

export async function generateImage(req: Req): Promise<{ data: Buffer; provider: string }> {
  const providers = chain()
  if (!providers.length) throw new Error('La generación de imágenes no está configurada.')
  for (const [name, call] of providers) {
    try {
      let img = sharp(await call(req), { limitInputPixels: 25000000 })
      if (req.aspect) {
        const [w, h] = req.aspect.split(':').map(Number), { width = 1024, height = 1024 } = await img.metadata()
        const s = Math.min(width / w, height / h)
        img = img.resize(Math.round(w * s), Math.round(h * s), { fit: 'cover' })
      }
      return { data: await img.webp({ quality: 92 }).toBuffer(), provider: name }
    } catch (e) {
      console.error(`[imagen] ${name} falló:`, (e as Error).message) // el siguiente proveedor lo intenta
    }
  }
  throw new Error('El proveedor no pudo generar la imagen. Inténtalo más tarde.')
}
