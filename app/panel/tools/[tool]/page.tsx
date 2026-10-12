import { ImageForm } from '@/lib/image-form'
import { notFound, redirect } from 'next/navigation'
import { coins, FREE_MONTHLY } from '@/lib/credits'
import { OBJECTIVES, PLATFORMS, PROMPT_TARGETS, TOOLS, toolCost } from '@/lib/meta'
import { Icon } from '@/lib/icons'
import { ProfitFields } from '@/lib/profit-form'
import { requireUser } from '@/lib/auth'
import { TranscriptInput } from '@/lib/transcript-input'
import { MediaUpload } from '@/lib/media-upload'
import { ASPECT_LABEL, ASPECTS, LOOKS } from '@/lib/product3d'

const ERR: Record<string, string> = {
  url: 'Pega el enlace completo de un video público de TikTok o Instagram.', download_config: 'La descarga por enlace no está configurada. Sube el archivo del video.', audio_config: 'La transcripción de audio aún no está configurada. No se cobraron monedas.',
  image_config: 'La generación y edición de imágenes aún no está configurada. No se cobraron monedas.', video_config: 'La generación de video aún no está configurada. No se cobraron monedas.',
  credits: 'No tienes monedas suficientes para esta herramienta.', limit: `Llegaste a los ${FREE_MONTHLY} usos gratis de este mes. Vuelven el próximo mes.`, invalid: 'Revisa los datos del formulario.',
  files: 'Sube la cantidad de archivos que pide la herramienta (en 3D: de 2 a 3 fotos).', size: 'El archivo supera el tamaño máximo.',
  type: 'Formato de archivo no válido.', brand: 'Completa el nombre y la moneda en Mi marca antes de crear tu página.', error: 'No se pudo crear el análisis. Inténtalo de nuevo.',
}

const Opts = ({ list }: { list: string[] }) => <>{list.map(o => <option key={o}>{o}</option>)}</>

export default async function Tool({ params, searchParams }: { params: Promise<{ tool: string }>; searchParams: Promise<{ e?: string; modo?: string }> }) {
  const { tool } = await params
  const { e, modo } = await searchParams
  if (tool === 'foto') redirect(`/panel/tools/imagen?modo=fondo${e ? `&e=${e}` : ''}`) // foto es un modo de Crea una imagen
  if (tool === 'video3d') redirect(`/panel/tools/imagen3d?modo=video${e ? `&e=${e}` : ''}`) // video3d es un modo de Tu producto en 3D
  const form = tool === 'imagen' && modo === 'fondo' ? 'foto' : tool === 'imagen3d' && modo === 'video' ? 'video3d' : tool
  if (!(tool in TOOLS)) notFound()
  const t = TOOLS[tool as keyof typeof TOOLS]
  const cost = toolCost(form as keyof typeof TOOLS)
  const user = await requireUser()
  return (
    <>
      <a className="tool-back" href="/panel">← Todas las herramientas</a>
      <div className="tool-page-heading"><Icon name={tool} /><div><span className="eyebrow">{tool === 'profit' ? 'LOS NÚMEROS DE TU NEGOCIO' : 'DALE UNA NUEVA MIRADA A TU CONTENIDO'}</span><h1>{t.title}</h1><p className="muted">{t.desc}</p></div></div>
      {e && <div className="err">{ERR[e] ?? ERR.error}{e === 'credits' && <> <a href="/panel/buy">Comprar monedas ↗</a></>}</div>}
      {tool === 'imagen' && <div className="row" role="tablist"><a className={form === 'imagen' ? 'btn' : 'btn ghost'} role="tab" aria-selected={form === 'imagen'} href="/panel/tools/imagen">Crear desde cero</a><a className={form === 'foto' ? 'btn' : 'btn ghost'} role="tab" aria-selected={form === 'foto'} href="/panel/tools/imagen?modo=fondo">Editar mi foto (fondo y más)</a></div>}
      {tool === 'imagen3d' && <div className="row" role="tablist"><a className={form === 'imagen3d' ? 'btn' : 'btn ghost'} role="tab" aria-selected={form === 'imagen3d'} href="/panel/tools/imagen3d">Imagen 3D</a><a className={form === 'video3d' ? 'btn' : 'btn ghost'} role="tab" aria-selected={form === 'video3d'} href="/panel/tools/imagen3d?modo=video">Video 3D (8 s)</a></div>}
      <form className={form === 'imagen' ? 'form image-tool-form' : 'form'} method="post" action="/api/runs" encType="multipart/form-data">
        <div className="form-heading"><span className="form-step">01</span><div><h2>{form === 'profit' ? 'Calcula tu precio en dos pasos' : form === 'prompt' ? 'Cuéntanos qué quieres lograr' : form === 'landing' ? 'Arma tu página de venta' : 'Prepara tu análisis'}</h2><p>{form === 'profit' ? 'Moneda: ' + (user.brand.currency || 'PEN') + '. Escribe los montos por una unidad.' : 'Añade tu material y el contexto para obtener recomendaciones útiles.'}</p></div></div>
        <input type="hidden" name="tool" value={form} />
        {form === 'profit' && <ProfitFields />}
        {form === 'imagen' && <ImageForm brand={user.brand} />}
        {form === 'transcribir' && <TranscriptInput linksEnabled={!!process.env.YTDLP_PATH} />}
        {(form === 'hooks' || form === 'creativo' || form === 'video' || form === 'guion' || form === 'foto') && <MediaUpload tool={form === 'guion' || form === 'foto' ? 'creativo' : form} />}
        {(form === 'guion' || form === 'foto') && <><label htmlFor="description">Cuéntanos sobre tu producto{form === 'foto' && ' (opcional en «Sin fondo»)'}</label><textarea id="description" name="description" required={form === 'guion'} maxLength={2000} rows={4} placeholder="Qué es, para qué sirve y qué beneficios puedes demostrar. Incluye solo datos reales." />{form === 'guion' ? <><label htmlFor="duration">¿Cuánto durará tu video?</label><select id="duration" name="duration" defaultValue="30"><option value="15">15 segundos · Corto y directo</option><option value="30">30 segundos · Beneficio y demostración</option><option value="60">60 segundos · Explicación más completa</option></select></> : <><label htmlFor="style">¿Cómo quieres tu foto?</label><select id="style" name="style"><option value="catalogo">Catálogo · Fondo blanco y limpio</option><option value="anuncio">Anuncio · Fondo atractivo para tu marca</option><option value="sinfondo">Sin fondo · PNG transparente</option><option value="libre">Lo que yo pida · Agregar algo, cambiar la escena…</option></select><label htmlFor="request">¿Qué quieres cambiar? (obligatorio en «Lo que yo pida»)</label><textarea id="request" name="request" maxLength={500} rows={3} placeholder="Ej.: Agrega hojas de menta y gotas de agua alrededor. / Ponlo sobre una mesa de mármol." /><p className="tag">Tu producto no se modifica: solo cambia lo que está alrededor. Genera una versión por solicitud. Revisa los detalles del producto antes de usarla.</p></>}</>}
        {(form === 'imagen3d' || form === 'video3d') && <><MediaUpload tool="angulos" /><p className="tag">Sube de 2 a 3 fotos del mismo producto desde ángulos distintos (frente, lado, atrás). Cuantos más ángulos, menos inventa la IA.</p><label htmlFor="description">Cuéntanos sobre tu producto</label><textarea id="description" name="description" required maxLength={2000} rows={3} placeholder="Qué es, tamaño, material y colores reales. Ej.: Botella de vidrio ámbar de 500 ml con tapa negra." /><div className="row"><div><label htmlFor="look">{form === 'imagen3d' ? 'Estilo 3D' : 'Movimiento'}</label><select id="look" name="look">{Object.entries(LOOKS[form]).map(([v, [label]]) => <option key={v} value={v}>{label}</option>)}</select></div><div><label htmlFor="aspect">Formato</label><select id="aspect" name="aspect">{ASPECTS[form].map(a => <option key={a} value={a}>{ASPECT_LABEL[a]}</option>)}</select></div></div></>}
        {(form === 'whatsapp' || form === 'copy') && <><label htmlFor="description">¿Qué vendes?</label><textarea id="description" name="description" required maxLength={2000} rows={4} placeholder="Producto, para qué sirve, tallas o variantes y beneficios reales. Solo datos verdaderos." />{form === 'whatsapp' ? <><div className="row"><div><label htmlFor="price">Precio (opcional)</label><input id="price" name="price" maxLength={500} placeholder="Ej.: S/ 45, 2 por S/ 80" /></div><div><label htmlFor="payment">Formas de pago (opcional)</label><input id="payment" name="payment" maxLength={500} placeholder="Ej.: Yape, Plin, transferencia" /></div></div><label htmlFor="delivery">Envío y entrega (opcional)</label><input id="delivery" name="delivery" maxLength={500} placeholder="Ej.: Lima 24 h S/ 10, provincias por Shalom" /><p className="tag">Lo que no completes aparecerá como [completa: dato] para que lo llenes tú. Nunca inventamos precios ni plazos.</p></> : <><label htmlFor="hook">Hook elegido (opcional)</label><input id="hook" name="hook" maxLength={500} placeholder="Pega aquí el hook que elegiste en Hooks desde Producto" /></>}</>}
        {form === 'prompt' && <><label htmlFor="target">¿Para qué es tu prompt?</label><select id="target" name="target">{Object.entries(PROMPT_TARGETS).map(([v, [label, where]]) => <option key={v} value={v}>{label} · {where}</option>)}</select><label htmlFor="description">Tu idea o tu prompt actual</label><textarea id="description" name="description" required maxLength={2000} rows={5} placeholder="Ej.: quiero una foto bonita de mi perfume para Instagram. / Pega aquí el prompt que ya usaste y no te convenció." /><p className="tag">No hace falta escribir perfecto: te lo devolvemos detallado, con los colores, tono y público de Mi marca, y te decimos dónde pegarlo.</p></>}
        {form === 'landing' && <><MediaUpload tool="hooks" /><p className="tag">De 1 a 5 fotos de tu producto. La primera será la foto principal de la página.</p><label htmlFor="description">Cuéntanos sobre tu producto</label><textarea id="description" name="description" required maxLength={2000} rows={5} placeholder="Qué es, para quién, beneficios reales, tallas o variantes, envíos y formas de pago. Solo datos verdaderos." /><div className="row"><div><label htmlFor="price">Precio por unidad ({user.brand.currency || 'moneda de Mi marca'})</label><input id="price" name="price" type="number" step="0.01" min="0.01" max="1000000" required /></div><div><label htmlFor="whatsapp">WhatsApp para recibir mensajes (opcional)</label><input id="whatsapp" name="whatsapp" type="tel" maxLength={20} placeholder="Ej.: 51987654321 (con código de país)" /></div></div><p className="tag">Tu página queda publicada con un enlace para compartir en tu bio, anuncios o estados. Incluye un formulario de pedido y, si pones tu número, un botón de WhatsApp. Podrás editar los textos después.</p>{!user.brand.name || !user.brand.currency ? <p className="err">Antes completa el nombre y la moneda en <a href="/panel/brand">Mi marca</a>.</p> : null}</>}
        {form !== 'profit' && form !== 'imagen' && form !== 'prompt' && form !== 'landing' && (
          <>
            {!['guion', 'foto', 'whatsapp', 'copy', 'imagen3d', 'video3d'].includes(form) && <><label htmlFor="description">Detalles de tu producto o campaña (opcional)</label><textarea id="description" name="description" maxLength={2000} rows={3} placeholder="Nombre del producto, beneficio real, situación de uso y oferta si existe. Lo que no se ve en la foto o video ayuda a personalizar el resultado." /><p className="tag">Cuanto más específico seas, más útiles serán las propuestas. El público y tono se toman de Mi marca.</p></>}
            {!['whatsapp', 'imagen3d', 'video3d'].includes(form) && <div className="row">
              <div><label htmlFor="objective">Objetivo</label><select id="objective" name="objective"><Opts list={OBJECTIVES} /></select></div>
              <div><label htmlFor="platform">Plataforma de este contenido</label><select id="platform" name="platform" defaultValue={PLATFORMS.find(p => user.brand.channels?.split(',').map(c => c.trim()).includes(p)) || 'Multicanal'}><Opts list={PLATFORMS} /></select></div>
            </div>}
            <div className="note"><b>{user.brand.name || 'Mi marca'}</b><p className="tag">Las recomendaciones usan el público, tono, país y preferencias que configuraste en Mi marca.</p><a href="/panel/brand">{user.brand.name ? 'Revisar mi marca' : 'Completar mi marca'} ↗</a></div>
          </>
        )}
        <p className="note">{cost ? <>Costo: <b>{coins(cost)}{form === 'imagen' || form === 'foto' || form === 'imagen3d' ? ' por imagen' : form === 'video3d' ? ' por video de 8 segundos' : form === 'transcribir' ? ' · transcripción y paráfrasis incluidas' : ''}</b>. Si el análisis falla, se devuelven automáticamente.</> : <b>Gratis</b>}</p>
        <button>{form === 'profit' ? 'Ver a cuánto venderlo' : form === 'guion' ? 'Crear mi guion' : form === 'imagen' ? 'Generar mi imagen' : form === 'transcribir' ? 'Pasar mi video a texto' : form === 'foto' ? 'Preparar mi foto' : form === 'imagen3d' ? 'Crear mi imagen 3D' : form === 'video3d' ? 'Crear mi video 3D' : form === 'whatsapp' ? 'Crear mis respuestas' : form === 'copy' ? 'Escribir mi publicación' : form === 'prompt' ? 'Mejorar mi prompt' : form === 'landing' ? 'Crear mi página' : 'Analizar mi contenido'} <span aria-hidden="true">↗</span></button>
      </form>
    </>
  )
}
