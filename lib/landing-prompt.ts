// Prompt pro de landing: plantilla fija, solo se rellena la sección 1. Campo vacío → PENDIENTE.
export const LANDING_FIELDS = [
  ['empresa', 'Empresa / marca', ''],
  ['producto', 'Nombre del producto', 'Ej.: Lámpara Luna Recargable'],
  ['que_es', '¿Qué es? (una frase)', 'Ej.: Lámpara de mesa LED que se carga por USB'],
  ['medidas', 'Medidas, peso y material', 'Ej.: 20 cm de alto, 350 g, base de madera'],
  ['colores', 'Colores', 'Ej.: Blanco cálido, negro'],
  ['funciones', 'Funciones (qué hace)', 'Ej.: 3 intensidades de luz, 8 horas de batería'],
  ['incluye', 'Accesorios o qué incluye la caja', 'Ej.: Cable USB-C y manual'],
  ['problema', '¿Para qué sirve o qué problema resuelve?', ''],
  ['publico', '¿Quién lo compra? (público)', ''],
  ['pais', 'País o ciudad donde se vende', ''],
  ['temporada', 'Temporada o fecha clave', 'Ej.: Día de la Madre, Navidad'],
  ['precio', 'Precio y promociones', 'Ej.: S/ 89, 2 por S/ 160'],
  ['canal', 'Canal de venta', 'Ej.: WhatsApp y formulario'],
  ['whatsapp', 'Número de WhatsApp / enlace de compra', 'Ej.: +51 987 654 321'],
  ['envios', 'Envíos, formas de pago y garantía', 'Ej.: Lima 24 h, Yape/Plin, 3 meses de garantía'],
  ['redes', 'Redes sociales', 'Ej.: @mimarca en Instagram y TikTok'],
  ['marca_visual', 'Logo o colores de marca', ''],
] as const
export type LandingKey = typeof LANDING_FIELDS[number][0]
export const AMBIENTES = ['divertido', 'elegante', 'técnico', 'natural', 'premium', 'festivo', 'minimalista', 'juvenil'] as const
export const TONOS = ['cercano', 'entusiasta', 'profesional', 'inspirador', 'directo'] as const

export const HEX = /^#[0-9a-f]{6}$/i
// Colores #hex que el usuario escribió en Mi marca (si los hay).
export const hexesIn = (s = '') => s.match(/#[0-9a-f]{6}\b/gi) ?? []
// Texto legible sobre un color: tinta oscura sobre colores claros, blanco sobre oscuros (luminancia WCAG).
export function readableOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.18 ? '#202020' : '#ffffff'
}

// Web de referencia: se extraen decisiones de diseño, nunca su marca ni sus textos (evita el look "hecho con IA").
const referenceBlock = (url: string) => url
  ? `- Usa ${url} SOLO como referencia de diseño. Antes de diseñar, analízala: estructura, jerarquía visual, navegación, composición de la portada, espacios y márgenes, tipografías y relación de tamaños, paleta, estilo de botones, tratamiento de imágenes, tarjetas, animaciones y comportamiento al hacer scroll. Extrae sus principios y aplícalos a este producto con la paleta de la marca. No copies su branding, textos, imágenes ni contenido.`
  : '- Si adjunto capturas de una web que me gusta, úsalas solo como referencia de diseño: extrae estructura, tipografías, espacios, botones e interacciones, sin copiar su marca, textos ni imágenes.'

export function buildLandingPrompt(d: Partial<Record<LandingKey, string>>, ambiente: string, tono: string, colors?: { primary: string; accent: string }, referencia = '') {
  const datos = LANDING_FIELDS.map(([k, label]) => `- ${label}: ${d[k]?.trim() || 'PENDIENTE'}`).join('\n')
    + (colors ? `\n- Colores exactos de la marca: principal ${colors.primary}, acento ${colors.accent}. Úsalos como base de la paleta (botones, títulos y detalles) con buen contraste.` : '')
  return `Actúa como un equipo formado por un estratega de marketing, un copywriter de ventas y un diseñador web senior. Con las fotos y videos que adjunto, crea una landing page única, persuasiva y basada en investigación real. No uses una plantilla genérica.

=== 1. DATOS DEL PRODUCTO (lo marcado como PENDIENTE debe aparecer así en la página) ===
${datos}

=== 2. ANALIZA PRIMERO EL MATERIAL ADJUNTO ===
- Revisa cada foto y video: qué muestra, desde qué ángulo y qué detalles se ven (texturas, acabados, botones, compartimentos, etiquetas).
- Usa lo que se ve para describir el producto con precisión, sin inventar nada.
- Si lo que se ve no coincide con los datos escritos (por ejemplo, otro material o medidas distintas), avísame antes de terminar y explica qué versión usaste.
- Decide qué foto va en la portada (la más llamativa y limpia) y dónde va cada una de las demás.
- Si hay fotos del producto desde varios ángulos (frente, lados, espalda), arma un visor que permita girarlo deslizando el dedo o con botones, y que explique un detalle distinto en cada vista.
- Si hay video, ponlo en un formato acorde a su orientación (vertical tipo celular u horizontal), que se reproduzca sin sonido y en bucle, con un botón para activar el sonido si el producto hace ruido, canta o habla.
- Optimiza las imágenes para que carguen rápido.
- Si falta material, dime qué fotos o tomas convendría producir.

=== 3. INVESTIGACIÓN EN INTERNET (antes de diseñar) ===
- Busca productos similares y revisa 3–5 tiendas o competidores: cómo los presentan, qué destacan, precios de referencia y qué les falta.
- Revisa reseñas y comentarios de compradores de productos parecidos para encontrar qué valoran, qué les preocupa y qué dudas tienen antes de comprar.
- Identifica las palabras que usa la gente al buscar este producto y úsalas en títulos y SEO.
- Busca usos o lugares de uso que no sean obvios y que sirvan como argumento de venta.
- Al final, entrégame un resumen corto de lo que encontraste y cómo lo aplicaste. No copies textos ni diseños de otros sitios.

=== 4. CONCEPTO Y DISEÑO NO GENÉRICO ===
${referenceBlock(referencia.trim())}
- Define un concepto creativo propio (una idea central o historia) y aplícalo en toda la página.
- Evita plantillas típicas: nada de bloques idénticos repetidos, íconos de relleno ni frases vacías como "la mejor calidad" o "innovador".
- Saca la paleta de colores de la marca (si hay colores exactos, respétalos) y compleméntala con los del propio producto; usa tipografías con personalidad y que se lean bien.
- Si el tamaño importa, muéstralo con una comparación visual a escala frente a objetos conocidos (una puerta, una mesa, una mano, un celular) o con una regla. Traduce las medidas a algo cotidiano (por ejemplo, "del tamaño de un niño de 6 años").
- Incluye al menos un elemento interactivo relacionado con el producto (visor 360°, comparador, antes/después, selector de colores o tamaños).
- Ambiente: ${ambiente}
- Pensada primero para celular, con animaciones suaves y sin recargar.

=== 5. ESTRUCTURA (adáptala al producto; agrega u omite secciones) ===
1. Portada: título con el beneficio principal, foto principal, precio y botón de compra.
2. Detalles: visor o galería con explicación de cada parte.
3. Video del producto en uso.
4. Tamaño, escala o característica estrella.
5. Usos y lugares donde se puede usar.
6. Comparación frente a alternativas (sin nombrar marcas).
7. Ficha técnica y qué incluye la caja.
8. Opiniones de clientes (solo si hay reales; si no, deja el espacio indicado).
9. Preguntas frecuentes basadas en las dudas reales encontradas en la investigación.
10. Llamado final con oferta, urgencia (solo si es real) y garantía.
11. Pie de página con contacto y redes.

=== 6. TEXTOS ===
- Idioma: español, adaptado al país de venta.
- Tono: ${tono}.
- Beneficios antes que características; títulos concretos y frases cortas.
- Responde las dudas del cliente antes de que las tenga.
- No inventes precios, medidas, materiales, estadísticas ni testimonios. Todo dato que falte debe aparecer visible en la página como PENDIENTE para que lo complete.

=== 7. VENTA Y CONFIANZA ===
- Botón de compra visible en las secciones clave y botón flotante de WhatsApp (u otro canal).
- Mensaje de WhatsApp ya escrito con el nombre del producto.
- Si hay formulario, debe enviar de verdad (por ejemplo con Formspree o abriendo WhatsApp con los datos ya escritos): valida los campos, muestra un mensaje de éxito o de error y nunca dejes un formulario decorativo que no envía nada.
- El número de WhatsApp y el mensaje deben poder cambiarse en una sola línea al inicio del código.
- Sellos de confianza (envío, pago seguro, garantía, devoluciones) solo si aplican.
- Propón 2 títulos alternativos para probar cuál vende más.

=== 8. REQUISITOS TÉCNICOS ===
- Un solo archivo HTML con el CSS y el JavaScript incluidos, más las imágenes y videos como archivos aparte.
- Carga rápida e imágenes con carga diferida.
- SEO: título, meta descripción, encabezados en orden, textos alternativos en las imágenes, datos estructurados de producto y etiquetas para compartir en redes (Open Graph).
- Accesible (buen contraste, navegable con teclado) y compatible con modo claro y oscuro.
- Código ordenado y comentado para editarlo fácilmente.
- Cookies: si usas analítica, píxel de Meta u otras cookies no esenciales, agrega un aviso de consentimiento que bloquee esos scripts hasta que la persona acepte, con opción de rechazar. Si no usas ninguna, no pongas banner.
- Agrega en el pie un enlace a la política de privacidad (déjala como PENDIENTE si no la tengo), acorde a la ley de protección de datos del país de venta.

=== 9. QUÉ DEBES ENTREGAR ===
1. La landing page lista para ver y compartir.
2. Resumen de la investigación (3–5 puntos) y el concepto creativo en 2–3 líneas.
3. Lista de datos PENDIENTES.
4. Diferencias encontradas entre los datos escritos y lo que se ve en las fotos o el video.
5. Los 2 títulos alternativos y recomendaciones de fotos o mejoras.

=== 10. REVISIÓN FINAL ANTES DE ENTREGAR ===
Comprueba y confírmame cada punto: título y meta descripción únicos; imagen para compartir (Open Graph) y favicon; el formulario envía y muestra confirmación; el botón de WhatsApp abre con el mensaje escrito; se ve bien en un celular pequeño; no hay enlaces rotos ni textos de ejemplo; los datos PENDIENTES están visibles; las imágenes cargan rápido.`
}
