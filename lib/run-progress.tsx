'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './icons'

const CONTENT: Record<string, [string, string, string[]]> = {
  semana: ['Tu semana está tomando forma', 'Estamos mirando tu producto y repartiendo tus publicaciones en la semana.', ['Qué publicar cada día', 'Gancho, tomas y texto listo', 'Tu plan guardado para abrir cada día']],
  transcribir: ['Tu archivo se convierte en texto', 'Estamos escuchando el audio y preparando una versión acorde a Mi marca.', ['Transcripción con tiempos', 'Apertura, desarrollo y cierre', 'Paráfrasis incluida en las 10 monedas']],
  imagen: ['Tu idea está tomando forma', 'Estamos creando una imagen a partir de tus siete indicaciones y Mi marca.', ['Una imagen en el formato elegido', 'El prompt completo para copiar', 'Descarga y resultado en tu historial']],
  guion: ['Tu próxima grabación empieza aquí', 'Estamos preparando un guion a partir de tu producto y el contexto de tu marca.', ['Una apertura para captar la atención', 'Qué decir y qué grabar en cada escena', 'Un cierre acorde a tu objetivo']],
  foto: ['Una nueva escena para tu producto', 'Estamos preparando la imagen con el estilo que elegiste.', ['Una versión para catálogo o anuncio', 'Comparación con tu foto original', 'Imagen para descargar y revisar']],
  retrato: ['Tu retrato está tomando forma', 'Estamos creando tu imagen a partir de tus fotos, conservando tu cara.', ['Un retrato o portada en el formato elegido', 'Fiel a tu cara y rasgos', 'Imagen para descargar y revisar']],
  ficha: ['Estamos estudiando tu producto', 'Describimos forma, materiales, colores y etiqueta tal como se ven en tu foto.', ['Una ficha visual lista para usar', 'Guardada en tu producto de Mi ruta', 'Se aplica en Foto, Imagen y 3D']],
  imagen3d: ['Tu producto toma volumen', 'Estamos combinando tus fotos para crear la imagen 3D.', ['Un render 3D en el formato elegido', 'Fiel a la forma y etiqueta de tus fotos', 'Imagen para descargar y revisar']],
  video3d: ['Tu producto está por girar', 'Estamos creando tu video de 8 segundos. Suele tardar de 1 a 4 minutos.', ['Un video de 8 segundos con música suave', 'El movimiento que elegiste', 'Video MP4 para descargar']],
  whatsapp: ['Tus respuestas se están escribiendo', 'Estamos preparando respuestas con el tono de Mi marca y solo con tus datos.', ['Una respuesta por situación', 'Objeciones y seguimiento incluidos', 'Datos faltantes marcados para completar']],
  copy: ['Tu publicación está tomando forma', 'Estamos escribiendo el texto para tu plataforma y objetivo.', ['Tres versiones de caption', 'Hashtags amplios y de nicho', 'Un primer comentario para conversar']],
  prompt: ['Tu prompt está mejorando', 'Estamos agregando detalle, tu marca y el formato que necesita la herramienta de destino.', ['Un prompt listo para copiar', 'Dónde pegarlo y cómo usarlo', 'Qué datos conviene completar']],
  landing: ['Tu página de venta está tomando forma', 'Estamos escribiendo los textos con tus fotos y datos, y publicando la página.', ['Titular y beneficios de tu producto', 'Preguntas frecuentes y botón de WhatsApp', 'Un enlace listo para compartir']],
  hooks: ['Una buena idea empieza con un buen hook', 'Estamos explorando distintas aperturas para este producto.', ['Ideas agrupadas por ángulo', 'Por qué cada idea encaja con tu producto', 'Qué mostrar en los primeros segundos']],
  creativo: ['Una mirada detallada a tu anuncio', 'Estamos revisando tu imagen y su mensaje para tu público.', ['Puntajes con explicación', 'Cambios ordenados por prioridad', 'Recomendaciones concretas para tu anuncio']],
  video: ['Tu contenido, con una nueva perspectiva', 'Estamos revisando el material disponible de tu video.', ['Hallazgos con tiempos aproximados', 'Acciones para mejorar tu contenido', 'Hooks alternativos y un cierre sugerido']],
}
export function RunProgress({ tool, status, assets, brand, duration }: { tool: string; status: string; assets: string[]; brand: string; duration?: number }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [tip, setTip] = useState(0)
  const [title, description, items] = CONTENT[tool] || CONTENT.video
  useEffect(() => { const timer = setInterval(() => router.refresh(), 4000); return () => clearInterval(timer) }, [router])
  useEffect(() => { const timer = setInterval(() => setTip(i => (i + 1) % items.length), 6000); return () => clearInterval(timer) }, [items.length])
  const running = status === 'RUNNING'
  return <section className="run-wait">
    <div className="wait-visual"><div className="wait-orbit" aria-hidden="true" /><div className="wait-product">{assets[0] && tool !== 'video' && tool !== 'transcribir' ? <img src={`/api/assets/${assets[0]}`} alt="Producto que estás preparando" /> : <Icon name={tool} />}</div><span className="wait-badge">✦ {running ? 'En preparación' : 'En espera'}</span><div className="wait-context"><b>{brand || 'Tu producto'}</b><span>{tool === 'guion' && duration ? `Guion de ${duration} segundos` : 'Un resultado para tu contenido'}</span></div></div>
    <div className="wait-content"><span className="eyebrow">TU IDEA ESTÁ EN MARCHA</span><h2>{title}</h2><p>{running ? description : 'Tu solicitud está en cola. Empezaremos cuando haya un espacio disponible.'}</p>
      <ol className="wait-stages" aria-label="Estado del trabajo"><li className={running ? 'complete' : 'current'} aria-current={!running ? 'step' : undefined}><span>{running ? '✓' : '1'}</span><div><b>Solicitud recibida</b><small>{running ? 'Lista para procesar' : 'Esperando su turno'}</small></div></li><li className={running ? 'current' : ''} aria-current={running ? 'step' : undefined}><span>{running ? <i className="wait-spinner" /> : '2'}</span><div><b>{tool === 'guion' ? 'Creando tu guion' : tool === 'foto' ? 'Preparando tu foto' : tool === 'imagen3d' ? 'Creando tu imagen 3D' : tool === 'video3d' ? 'Creando tu video 3D' : tool === 'prompt' ? 'Mejorando tu prompt' : tool === 'landing' ? 'Creando tu página' : 'Preparando el análisis'}</b><small>Con tu material y Mi marca</small></div></li><li><span>3</span><div><b>Resultado listo</b><small>Lo verás aquí al terminar</small></div></li></ol>
      <div className="wait-tip"><span aria-hidden="true">✦</span><div><small>LO QUE RECIBIRÁS</small><p>{items[tip]}</p></div></div>
      <button className="link wait-toggle" type="button" aria-expanded={expanded} aria-controls="wait-deliverables" onClick={() => setExpanded(!expanded)}>{expanded ? 'Ocultar detalles −' : 'Ver qué incluye mi resultado +'}</button>{expanded && <ul id="wait-deliverables" className="get">{items.map(item => <li key={item}>{item}</li>)}</ul>}
      <div className="wait-footer"><span role="status">Se actualiza automáticamente.</span><a href="/panel/history">Ir a mis análisis ↗</a></div><p className="wait-note">Puedes salir y volver desde tu historial. El tiempo depende de la herramienta y la disponibilidad del servicio.</p>
    </div>
  </section>
}
