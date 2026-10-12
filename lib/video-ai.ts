// Video con Veo (Gemini API): operación larga → sondeo cada 10 s → descarga del MP4.
// Los errores del proveedor solo van al log; al usuario, un mensaje genérico (no exponer datos de la clave).
type Img = { mime: string; data: Buffer }
const BASE = 'https://generativelanguage.googleapis.com/v1beta'
const FAIL = 'El servicio de video no respondió correctamente. Inténtalo más tarde.'
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Con imágenes de referencia Veo exige 8 s; máximo 3 referencias.
export const veoBody = (prompt: string, images: Img[], aspect: string) => ({
  instances: [{ prompt, referenceImages: images.slice(0, 3).map(i => ({ image: { inlineData: { mimeType: i.mime, data: i.data.toString('base64') } }, referenceType: 'asset' })) }],
  parameters: { aspectRatio: aspect, durationSeconds: 8, resolution: '720p' },
})

async function call(url: string, init: RequestInit, timeout: number) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) })
  if (!res.ok) { console.error(`[video] veo ${res.status}`, (await res.text()).slice(0, 300)); throw new Error(FAIL) }
  return res
}

export async function generateVideo(prompt: string, images: Img[], aspect: string) {
  const headers = { 'x-goog-api-key': process.env.GEMINI_API_KEY!, 'Content-Type': 'application/json' }
  const model = process.env.VEO_MODEL || 'veo-3.1-fast-generate-preview'
  let op = await (await call(`${BASE}/models/${encodeURIComponent(model)}:predictLongRunning`, { method: 'POST', headers, body: JSON.stringify(veoBody(prompt, images, aspect)) }, 60_000)).json()
  // ponytail: el worker queda ocupado mientras sondea (CONCURRENCY=2); cola aparte si hay muchos videos a la vez.
  const until = Date.now() + 8 * 60_000 // housekeeping corta a los 10 min
  while (!op.done) {
    if (Date.now() > until) throw new Error('El video tardó demasiado. Inténtalo de nuevo más tarde.')
    await sleep(10_000)
    op = await (await call(`${BASE}/${op.name}`, { headers }, 30_000)).json()
  }
  if (op.error) { console.error('[video] veo error', String(op.error.message).slice(0, 300)); throw new Error(FAIL) }
  const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
  if (!uri) {
    console.error('[video] veo sin video', JSON.stringify(op.response ?? {}).slice(0, 300))
    throw new Error('No se pudo generar el video con estas fotos (el servicio pudo filtrarlas). Prueba con otras fotos o descripción.')
  }
  return Buffer.from(await (await call(uri, { headers: { 'x-goog-api-key': headers['x-goog-api-key'] } }, 120_000)).arrayBuffer())
}
