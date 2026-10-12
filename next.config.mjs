// Cabeceras de seguridad: sin iframes de otros sitios (clickjacking), sin adivinar tipos, referer mínimo.
const security = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
export default { headers: async () => [{ source: '/:path*', headers: security }], poweredByHeader: false, serverExternalPackages: ['pg', '@huggingface/transformers'], distDir: process.env.NEXT_DIST_DIR || '.next' };
