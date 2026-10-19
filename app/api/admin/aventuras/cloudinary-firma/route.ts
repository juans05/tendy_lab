import { adminUser, slugify } from '@/lib/av-audit'
import { uploadSignature } from '@/lib/av-cloudinary'

// El navegador del admin sube directo a Cloudinary con esta firma; el secreto nunca sale del servidor.
export async function POST(req: Request) {
  if (!await adminUser()) return new Response(null, { status: 404 })
  const { slug } = await req.json().catch(() => ({}))
  return Response.json(uploadSignature(`tendy-aventuras/${slugify(String(slug ?? '')) || 'general'}`))
}
