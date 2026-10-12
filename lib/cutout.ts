import sharp from 'sharp'

// Quitar el fondo con un modelo de segmentación (BiRefNet_lite, MIT) que corre en el propio servidor:
// recorta los píxeles reales del producto y devuelve PNG transparente. Sin API key ni costo por imagen.
// ponytail: el modelo (~224 MB) se descarga en el primer uso y vive en memoria del proceso; hornearlo en la imagen Docker si el arranque en frío molesta.
const MODEL = 'onnx-community/BiRefNet_lite'
let loaded: Promise<[any, any]> | undefined
const load = () => loaded ??= (async () => {
  const { AutoModel, AutoProcessor } = await import('@huggingface/transformers')
  return Promise.all([AutoModel.from_pretrained(MODEL, { dtype: 'fp32' }), AutoProcessor.from_pretrained(MODEL)])
})().catch(e => { loaded = undefined; throw e }) // si falla la descarga, el siguiente intento reintenta

// Un recorte a la vez: cada inferencia usa ~1 GB y el worker corre 2 jobs en paralelo.
let line: Promise<unknown> = Promise.resolve()
export function removeBackground(data: Buffer) {
  const job = line.then(() => cutout(data))
  line = job.catch(() => {})
  return job
}

async function cutout(data: Buffer) {
  // Tope de 25 MP al decodificar (bombas de descompresión), orientación EXIF y máximo 2048 px para la inferencia.
  const { data: rgb, info } = await sharp(data, { limitInputPixels: 25_000_000 }).rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { RawImage } = await import('@huggingface/transformers')
  const [model, processor] = await load()
  const image = new RawImage(new Uint8ClampedArray(rgb), info.width, info.height, 3)
  const { pixel_values } = await processor(image)
  const { output_image } = await model({ input_image: pixel_values })
  const mask = await RawImage.fromTensor(output_image[0].sigmoid().mul(255).to('uint8')).resize(info.width, info.height)
  return sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
    .joinChannel(Buffer.from(mask.data), { raw: { width: info.width, height: info.height, channels: 1 } })
    .png().toBuffer()
}

// "Lo que yo pida" con un pedido de quitar el fondo → recorte real en vez de pedirle a la IA un fondo blanco.
export const wantsCutout = (style: string, request = '') =>
  style === 'sinfondo' || (style === 'libre' && /(qu[ií]t|elim|borr|rem[ou]e?v|s[aá]c)\p{L}*.{0,20}\bfondo\b|\bsin\s+fondo\b|\btransparente\b/iu.test(request))
