import { ImageForm } from '@/lib/image-form'
import { notFound, redirect } from 'next/navigation'
import { coins, FREE_MONTHLY } from '@/lib/credits'
import { OBJECTIVES, PLATFORMS, TOOLS, toolCost } from '@/lib/meta'
import { Icon } from '@/lib/icons'
import { ProfitFields } from '@/lib/profit-form'
import { requireUser } from '@/lib/auth'
import { TranscriptInput } from '@/lib/transcript-input'
import { MediaUpload } from '@/lib/media-upload'

const ERR: Record<string, string> = {
  url: 'Pega el enlace completo de un video público de TikTok o Instagram.', download_config: 'La descarga por enlace no está configurada. Sube el archivo del video.', audio_config: 'La transcripción de audio aún no está configurada. No se cobraron monedas.',
  image_config: 'La generación y edición de imágenes aún no está configurada. No se cobraron monedas.',
  credits: 'No tienes monedas suficientes para esta herramienta.', limit: `Llegaste a los ${FREE_MONTHLY} usos gratis de este mes. Vuelven el próximo mes.`, invalid: 'Revisa los datos del formulario.',
  files: 'Sube la cantidad de archivos que pide la herramienta.', size: 'El archivo supera el tamaño máximo.',
  type: 'Formato de archivo no válido.', error: 'No se pudo crear el análisis. Inténtalo de nuevo.',
}

const Opts = ({ list }: { list: string[] }) => <>{list.map(o => <option key={o}>{o}</option>)}</>

export default async function Tool({ params, searchParams }: { params: Promise<{ tool: string }>; searchParams: Promise<{ e?: string; modo?: string }> }) {
  const { tool } = await params
  const { e, modo } = await searchParams
  if (tool === 'foto') redirect(`/panel/tools/imagen?modo=fondo${e ? `&e=${e}` : ''}`) // foto es un modo de Crea una imagen
  const form = tool === 'imagen' && modo === 'fondo' ? 'foto' : tool
  if (!(tool in TOOLS)) notFound()
  const t = TOOLS[tool as keyof typeof TOOLS]
  const cost = toolCost(form as keyof typeof TOOLS)
  const user = await requireUser()
  return (
    <>
      <a className="tool-back" href="/panel">← Todas las herramientas</a>
      <div className="tool-page-heading"><Icon name={tool} /><div><span className="eyebrow">{tool === 'profit' ? 'LOS NÚMEROS DE TU NEGOCIO' : 'DALE UNA NUEVA MIRADA A TU CONTENIDO'}</span><h1>{t.title}</h1><p className="muted">{t.desc}</p></div></div>
      {e && <div className="err">{ERR[e] ?? ERR.error}{e === 'credits' && <> <a href="/panel/buy">Comprar monedas ↗</a></>}</div>}
      {tool === 'imagen' && <div className="row" role="tablist"><a className={form === 'imagen' ? 'btn' : 'btn ghost'} role="tab" aria-selected={form === 'imagen'} href="/panel/tools/imagen">Crear desde cero</a><a className={form === 'foto' ? 'btn' : 'btn ghost'} role="tab" aria-selected={form === 'foto'} href="/panel/tools/imagen?modo=fondo">Solo cambiar el fondo de mi foto</a></div>}
      <form className={form === 'imagen' ? 'form image-tool-form' : 'form'} method="post" action="/api/runs" encType="multipart/form-data">
        <div className="form-heading"><span className="form-step">01</span><div><h2>{form === 'profit' ? 'Calcula tu precio en dos pasos' : 'Prepara tu análisis'}</h2><p>{form === 'profit' ? 'Moneda: ' + (user.brand.currency || 'PEN') + '. Escribe los montos por una unidad.' : 'Añade tu material y el contexto para obtener recomendaciones útiles.'}</p></div></div>
        <input type="hidden" name="tool" value={form} />
        {form === 'profit' && <ProfitFields />}
        {form === 'imagen' && <ImageForm brand={user.brand} />}
        {form === 'transcribir' && <TranscriptInput linksEnabled={!!process.env.YTDLP_PATH} />}
        {(form === 'hooks' || form === 'creativo' || form === 'video' || form === 'guion' || form === 'foto') && <MediaUpload tool={form === 'guion' || form === 'foto' ? 'creativo' : form} />}
        {(form === 'guion' || form === 'foto') && <><label htmlFor="description">Cuéntanos sobre tu producto</label><textarea id="description" name="description" required maxLength={2000} rows={4} placeholder="Qué es, para qué sirve y qué beneficios puedes demostrar. Incluye solo datos reales." />{form === 'guion' ? <><label htmlFor="duration">¿Cuánto durará tu video?</label><select id="duration" name="duration" defaultValue="30"><option value="15">15 segundos · Corto y directo</option><option value="30">30 segundos · Beneficio y demostración</option><option value="60">60 segundos · Explicación más completa</option></select></> : <><label htmlFor="style">¿Cómo quieres tu foto?</label><select id="style" name="style"><option value="catalogo">Catálogo · Fondo blanco y limpio</option><option value="anuncio">Anuncio · Fondo atractivo para tu marca</option></select><p className="tag">Genera una versión por solicitud. Revisa los detalles del producto antes de usarla.</p></>}</>}
        {(form === 'whatsapp' || form === 'copy') && <><label htmlFor="description">¿Qué vendes?</label><textarea id="description" name="description" required maxLength={2000} rows={4} placeholder="Producto, para qué sirve, tallas o variantes y beneficios reales. Solo datos verdaderos." />{form === 'whatsapp' ? <><div className="row"><div><label htmlFor="price">Precio (opcional)</label><input id="price" name="price" maxLength={500} placeholder="Ej.: S/ 45, 2 por S/ 80" /></div><div><label htmlFor="payment">Formas de pago (opcional)</label><input id="payment" name="payment" maxLength={500} placeholder="Ej.: Yape, Plin, transferencia" /></div></div><label htmlFor="delivery">Envío y entrega (opcional)</label><input id="delivery" name="delivery" maxLength={500} placeholder="Ej.: Lima 24 h S/ 10, provincias por Shalom" /><p className="tag">Lo que no completes aparecerá como [completa: dato] para que lo llenes tú. Nunca inventamos precios ni plazos.</p></> : <><label htmlFor="hook">Hook elegido (opcional)</label><input id="hook" name="hook" maxLength={500} placeholder="Pega aquí el hook que elegiste en Hooks desde Producto" /></>}</>}
        {form !== 'profit' && form !== 'imagen' && (
          <>
            {!['guion', 'foto', 'whatsapp', 'copy'].includes(form) && <><label htmlFor="description">Detalles de tu producto o campaña (opcional)</label><textarea id="description" name="description" maxLength={2000} rows={3} placeholder="Nombre del producto, beneficio real, situación de uso y oferta si existe. Lo que no se ve en la foto o video ayuda a personalizar el resultado." /><p className="tag">Cuanto más específico seas, más útiles serán las propuestas. El público y tono se toman de Mi marca.</p></>}
            {form !== 'whatsapp' && <div className="row">
              <div><label htmlFor="objective">Objetivo</label><select id="objective" name="objective"><Opts list={OBJECTIVES} /></select></div>
              <div><label htmlFor="platform">Plataforma de este contenido</label><select id="platform" name="platform" defaultValue={PLATFORMS.find(p => user.brand.channels?.split(',').map(c => c.trim()).includes(p)) || 'Multicanal'}><Opts list={PLATFORMS} /></select></div>
            </div>}
            <div className="note"><b>{user.brand.name || 'Mi marca'}</b><p className="tag">Las recomendaciones usan el público, tono, país y preferencias que configuraste en Mi marca.</p><a href="/panel/brand">{user.brand.name ? 'Revisar mi marca' : 'Completar mi marca'} ↗</a></div>
          </>
        )}
        <p className="note">{cost ? <>Costo: <b>{coins(cost)}{form === 'imagen' || form === 'foto' ? ' por imagen' : form === 'transcribir' ? ' · transcripción y paráfrasis incluidas' : ''}</b>. Si el análisis falla, se devuelven automáticamente.</> : <b>Gratis</b>}</p>
        <button>{form === 'profit' ? 'Ver a cuánto venderlo' : form === 'guion' ? 'Crear mi guion' : form === 'imagen' ? 'Generar mi imagen' : form === 'transcribir' ? 'Pasar mi video a texto' : form === 'foto' ? 'Preparar mi foto' : form === 'whatsapp' ? 'Crear mis respuestas' : form === 'copy' ? 'Escribir mi publicación' : 'Analizar mi contenido'} <span aria-hidden="true">↗</span></button>
      </form>
    </>
  )
}
