// Opciones del perfil de marca. Los valores se guardan como texto separado por ", " (por eso ninguna lleva coma).
export type Opt = { value: string; label: string }
const o = (...v: string[]): Opt[] => v.map(x => ({ value: x, label: x }))

export const COUNTRIES = o('Perú', 'México', 'Colombia', 'Chile', 'Argentina', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Venezuela',
  'Brasil', 'Costa Rica', 'Panamá', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'República Dominicana', 'Cuba', 'Puerto Rico',
  'España', 'Estados Unidos')

export const CURRENCIES: Opt[] = [
  ['PEN', 'Sol peruano'], ['USD', 'Dólar estadounidense'], ['MXN', 'Peso mexicano'], ['COP', 'Peso colombiano'], ['CLP', 'Peso chileno'],
  ['ARS', 'Peso argentino'], ['BOB', 'Boliviano'], ['UYU', 'Peso uruguayo'], ['PYG', 'Guaraní'], ['VES', 'Bolívar'], ['BRL', 'Real brasileño'],
  ['CRC', 'Colón costarricense'], ['GTQ', 'Quetzal'], ['HNL', 'Lempira'], ['NIO', 'Córdoba'], ['DOP', 'Peso dominicano'], ['EUR', 'Euro'],
].map(([v, n]) => ({ value: v, label: `${v} · ${n}` }))

export const CATEGORIES = o('Moda y ropa', 'Calzado', 'Accesorios y joyería', 'Belleza y cuidado personal', 'Salud y bienestar',
  'Suplementos y nutrición', 'Alimentos y bebidas', 'Restaurantes y delivery', 'Hogar y decoración', 'Muebles', 'Electrodomésticos',
  'Tecnología y electrónica', 'Celulares y accesorios', 'Juguetes y niños', 'Bebés y maternidad', 'Mascotas', 'Deportes y fitness',
  'Outdoor y camping', 'Automotriz y motos', 'Herramientas y ferretería', 'Construcción', 'Papelería y oficina', 'Libros y educación',
  'Cursos y formación', 'Servicios profesionales', 'Marketing y publicidad', 'Inmobiliaria', 'Turismo y viajes', 'Eventos y regalos',
  'Navidad y temporadas', 'Arte y manualidades', 'Fotografía y video', 'Agro y jardinería', 'Industria y mayoristas', 'Software y apps')

export const AUDIENCES = o('Mujeres', 'Hombres', 'Adolescentes', 'Jóvenes de 18 a 24 años', 'Adultos de 25 a 34 años', 'Adultos de 35 a 44 años',
  'Adultos de 45 años o más', 'Adultos mayores', 'Familias', 'Padres y madres', 'Parejas', 'Estudiantes', 'Profesionales', 'Emprendedores',
  'Empresas (B2B)', 'Mayoristas y revendedores', 'Compradores de regalos', 'Deportistas', 'Amantes de las mascotas', 'Gamers',
  'Compradores que buscan precio', 'Compradores premium')

export const TONES = o('Cercano', 'Divertido', 'Práctico', 'Profesional', 'Formal', 'Informal', 'Inspirador', 'Motivacional', 'Educativo',
  'Elegante', 'Aspiracional', 'Juvenil', 'Empático', 'Directo', 'Persuasivo', 'Urgente', 'Minimalista', 'Auténtico', 'Técnico', 'Confiable',
  'Coloquial peruano')

export const AVOID = o('Promesas de dinero fácil', 'Resultados garantizados', 'Viral garantizado', 'Claims médicos o de curación',
  'Pérdida de peso rápida', 'Antes y después exagerados', 'Testimonios inventados', 'Escasez falsa', 'Groserías', 'Lenguaje ofensivo',
  'Política', 'Religión', 'Comparaciones con la competencia', 'Mayúsculas excesivas', 'Emojis excesivos', 'Anglicismos', 'Tecnicismos')

export const CHANNELS = o('TikTok', 'Instagram', 'Facebook', 'WhatsApp', 'WhatsApp Business', 'YouTube', 'YouTube Shorts', 'Meta Ads',
  'TikTok Ads', 'Google Ads', 'Email', 'SMS', 'Tienda online propia', 'Shopify', 'Mercado Libre', 'Amazon', 'Marketplace de Facebook',
  'Pinterest', 'X (Twitter)', 'LinkedIn', 'Telegram', 'Linktree', 'Tienda física', 'Podcast')

// campo → { opciones, solo una }
export const BRAND_FIELDS = {
  country: { options: COUNTRIES, single: false },
  currency: { options: CURRENCIES, single: true },
  category: { options: CATEGORIES, single: false },
  audience: { options: AUDIENCES, single: false },
  tone: { options: TONES, single: false },
  avoid: { options: AVOID, single: false },
  channels: { options: CHANNELS, single: false },
} as const
