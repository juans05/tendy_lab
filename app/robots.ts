import type { MetadataRoute } from 'next'

// Páginas privadas o con código de kit fuera de los buscadores.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/k/', '/aventuras/mis-fotos', '/admin', '/api', '/panel', '/pedido'] } }
}
