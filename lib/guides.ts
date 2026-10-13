// Guías de la Ruta. ponytail: contenido estático en código; mover a BD/CMS si el dueño las edita seguido.
// Contenido a validar por el dueño antes de publicar; cada guía cita su fuente oficial.
export type GuideSlug = 'ruc-10' | 'whatsapp-business' | 'landing-page' | 'meta-ads' | 'prompts-imagenes'
export type Guide = { slug: GuideSlug; title: string; icon: string; summary: string; why: string; steps: string[]; mistakes: string[]; sources: [string, string][]; video?: string }
export const GUIDES: Record<GuideSlug, Guide> = {
  'ruc-10': {
    slug: 'ruc-10', title: 'Saca tu RUC 10', icon: '🧾',
    summary: 'Formaliza tu negocio como persona natural, paso a paso.',
    why: 'Con RUC puedes emitir comprobantes, abrir cuentas de negocio y verificar tu empresa en Meta y WhatsApp Business.',
    steps: [
      'Ten a mano tu DNI vigente y la dirección donde funcionará tu negocio.',
      'Entra a la página de SUNAT y busca la inscripción al RUC para personas naturales con DNI. Si no puedes hacerlo en línea, acércate a un Centro de Servicios SUNAT.',
      'Elige tu actividad económica (por ejemplo, venta al por menor por internet) y registra tu domicilio fiscal.',
      'Elige tu régimen tributario. Para empezar con ventas pequeñas, revisa el Nuevo RUS y el Régimen MYPE Tributario y compara sus requisitos en la página de SUNAT.',
      'Obtén tu Clave SOL: con ella emites comprobantes y haces tus declaraciones.',
      'Guarda tu Ficha RUC en PDF: la necesitarás para verificar tu negocio en Meta.',
    ],
    mistakes: ['Elegir un régimen sin revisar el límite de ingresos y el tipo de comprobante que permite.', 'Registrar un domicilio fiscal donde no recibes notificaciones.', 'Olvidar las fechas de declaración mensual.'],
    sources: [['SUNAT · Orientación tributaria', 'https://orientacion.sunat.gob.pe/'], ['Gob.pe · Inscripción al RUC', 'https://www.gob.pe/']],
  },
  'whatsapp-business': {
    slug: 'whatsapp-business', title: 'Configura WhatsApp Business', icon: '💬',
    summary: 'Catálogo, respuestas rápidas y un perfil que da confianza.',
    why: 'Es donde se cierran tus ventas. Un perfil completo y respuestas rápidas te ahorran horas y transmiten seriedad.',
    steps: [
      'Instala WhatsApp Business con un número dedicado a tu negocio.',
      'Completa el perfil: nombre comercial, categoría, descripción, horario, dirección o zona de entrega y enlace a tu landing.',
      'Crea tu catálogo con foto, precio y descripción de cada producto (usa tus imágenes de TendyLab).',
      'Configura el mensaje de bienvenida y el de ausencia.',
      'Guarda tus respuestas rápidas: copia las de la herramienta Respuestas para WhatsApp y asígnales atajos como /precio o /envio.',
      'Usa etiquetas para ordenar a tus clientes: Nuevo, Pagado, Enviado, Seguimiento.',
      'Si quieres la insignia de verificación, revisa los requisitos de Meta Verified para empresas: suele pedir datos y documentos del negocio, como tu Ficha RUC.',
    ],
    mistakes: ['Usar tu número personal y mezclar clientes con familia.', 'Dejar el catálogo sin precios: el cliente pregunta y se enfría.', 'Prometer plazos o precios que luego no cumples.'],
    sources: [['WhatsApp Business · Centro de ayuda', 'https://faq.whatsapp.com/'], ['Meta · WhatsApp Business', 'https://business.whatsapp.com/']],
  },
  'landing-page': {
    slug: 'landing-page', title: 'Tu landing page', icon: '🌐',
    summary: 'Una página simple para vender tu producto, sin programar.',
    why: 'Tus anuncios necesitan un destino claro: una página que explique el producto y lleve a WhatsApp o al pedido.',
    steps: [
      'Empieza por el enlace de pedido de TendyLab (Mis pedidos): ya es una página con tu producto, precio y formulario.',
      'Si quieres algo más completo, usa un constructor sencillo de páginas y elige una plantilla de una sola sección.',
      'Arriba: el beneficio principal en una frase y una foto clara del producto (de Crea una imagen).',
      'Después: 3 beneficios concretos, qué incluye, precio y formas de pago y entrega.',
      'Un solo botón principal: "Pedir por WhatsApp" con un enlace wa.me que traiga el mensaje escrito.',
      'Pruébala en tu celular antes de usarla en anuncios: carga rápida y botón visible sin hacer scroll.',
    ],
    mistakes: ['Poner muchos botones y opciones: el cliente se distrae.', 'Fotos oscuras o de baja calidad.', 'Esconder el precio o el costo de envío.'],
    sources: [['WhatsApp · Enlaces para chatear (wa.me)', 'https://faq.whatsapp.com/']],
  },
  'meta-ads': {
    slug: 'meta-ads', title: 'Tu primer anuncio en Meta Ads', icon: '📣',
    summary: 'Tu primer anuncio con poco presupuesto, sin quemar dinero.',
    why: 'Los anuncios te ponen frente a compradores que todavía no te siguen. Bien medidos, te dicen cuánto te cuesta cada venta.',
    steps: [
      'Crea o revisa tu Página de Facebook y tu cuenta de Instagram de empresa, y conéctalas en Meta Business Suite.',
      'En el Administrador de anuncios crea una campaña con el objetivo de Interacción y destino WhatsApp (mensajes).',
      'Define un presupuesto diario pequeño que puedas permitirte perder mientras aprendes, y déjalo correr unos días sin tocarlo.',
      'Público: tu país o ciudad de entrega, rango de edad real de tus compradores e intereses relacionados con tu producto.',
      'Anuncio: tu mejor video o imagen (revísalos con Analiza mi Video o Analiza mi Creativo) y el copy de Copy para publicar.',
      'Mide el costo por conversación y compáralo con tu ganancia por venta de la calculadora del cajón.',
    ],
    mistakes: ['Cambiar el anuncio cada día: no dejas que el sistema aprenda.', 'Usar el botón "Promocionar" sin elegir objetivo ni público.', 'No saber cuánto puedes pagar por venta antes de empezar.'],
    sources: [['Meta · Centro de ayuda para empresas', 'https://www.facebook.com/business/help'], ['Meta Blueprint (cursos gratis)', 'https://www.facebook.com/business/learn']],
  },
  'prompts-imagenes': {
    slug: 'prompts-imagenes', title: 'Prompts para imágenes con IA', icon: '🎨',
    summary: 'Adapta prompts que ya funcionan a tu producto y a tu cara, sin gastar créditos de más.',
    why: 'Un buen prompt no se inventa desde cero: se toma uno probado de una librería y se adapta. Así tus fotos se ven profesionales y conservan tu producto real.',
    steps: [
      'Busca un prompt que te guste en una librería: YouMind (gratis y en español), Meigen AI (galería visual) o PromptBase (de pago, de 2 a 10 dólares por prompt).',
      'Paso 1 · Adáptalo: pégalo en Mejorar mi prompt. Se conservan cámara, luz y acabado; solo cambian el sujeto y el entorno, y se quitan marcas y nombres del ejemplo.',
      'Paso 2 · Revísalo antes de generar: sin restos del ejemplo original, sin dos luces o dos formatos a la vez, con la relación de aspecto correcta y sin texto ni marcas de agua.',
      'Paso 3 · Itera: si el resultado casi está, usa «Cambiar una sola cosa» en el resultado. Un cambio por vuelta, todo lo demás igual.',
      '¿Encontraste una imagen sin prompt? En Mejorar mi prompt elige «Copiar el estilo de una imagen que me gusta» y súbela.',
      'Qué uso para qué: foto real del producto → Editar mi foto; ficha de tienda → estilo Catálogo; imagen principal → Anuncio; publicación con contexto → En uso; anuncio con texto encima → Color; carrusel o cabecera → Flat lay; foto de perfil o miniatura → Retrato y portada; plano vertical en movimiento → Video 3D.',
      'Escribe los prompts de imagen y video en inglés: los modelos responden con más precisión. Mejorar mi prompt te da la traducción para que sepas qué pide.',
    ],
    mistakes: ['Cambiar varias cosas a la vez: no sabrás cuál arregló (o rompió) la imagen.', 'Pedir mucho texto dentro de la imagen: con más de 3 o 4 palabras aparecen letras inventadas.', 'Animar una imagen y recortarla después a 9:16: decide el formato vertical antes de animar.', 'Usar adjetivos que no describen nada visible («increíble», «premium»): no cambian la imagen.'],
    sources: [['Recopilación de prompts del curso (Notion)', 'https://app.notion.com/p/El-secreto-de-los-Prompts-para-Generar-Im-genes-con-IA-3d60714ba62e80818ce7d36d121a3b00'], ['YouMind', 'https://youmind.com/'], ['PromptBase', 'https://promptbase.com/']],
  },
}
