import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { currentUser } from '@/lib/auth'
import { normalizeCode } from '@/lib/av-codes'
import { loadStory } from '@/lib/av-story-db'
import { imageUrl, videoUrl } from '@/lib/av-cloudinary'
import { getSettings } from '@/lib/av-settings'
import { Player } from '@/lib/av-player'
import '../aventuras.css'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ k?: string; preview?: string }> }

const load = (slug: string) => q(`select a.*,c.name as collection,ch.name as character,ch.image_public_id as character_image
  from adventures a join collections c on c.id=a.collection_id left join characters ch on ch.id=a.character_id where a.slug=$1`, [slug])

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params, { k } = await searchParams
  const [a] = /^[a-z0-9-]+$/.test(slug) ? await load(slug) : []
  // Con código de kit en la URL no se indexa: el enlace pertenece a un kit.
  return { title: a ? `${a.title} · Tendy Aventuras` : 'Tendy Aventuras', description: a?.description, robots: k || !a?.published ? { index: false, follow: false } : undefined, alternates: { canonical: `/aventuras/${slug}` } }
}

export default async function Aventura({ params, searchParams }: Props) {
  const { slug } = await params, { k, preview } = await searchParams
  if (!/^[a-z0-9-]+$/.test(slug)) notFound()
  const [a] = await load(slug)
  if (!a || (!a.published && !(preview && (await currentUser())?.is_admin))) notFound()
  const code = k ? normalizeCode(k) : null
  const kit = code ? (await q(`select 1 from qr_codes where code=$1`, [code])).length > 0 : false
  const story = await loadStory(a.id)
  story.scenes = story.scenes.map(s => ({ ...s, video: videoUrl(s.video), image: s.image ? imageUrl(s.image) : null }))
  const others = await q<{ slug: string; title: string }>(`select slug,title from adventures where published and id<>$1 order by updated_at desc limit 6`, [a.id])
  const settings = await getSettings()
  return <Player story={story} code={kit ? code : null} kitsUrl={settings.kits_url} others={others}
    adventure={{ slug: a.slug, title: a.title, description: a.description, collection: a.collection, character: a.character ?? 'tu personaje', minutes: a.minutes, mission: a.mission, characterImage: a.character_image ? imageUrl(a.character_image, 400) : undefined }} />
}
