import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { loadStory } from '@/lib/av-story-db'
import { StoryEditor } from '@/lib/av-scene-editor'
import { templateFor } from '@/lib/av-card'

export default async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [a] = await q(`select a.id,a.slug,a.title,a.description,a.minutes,a.cover_public_id,a.mission,a.published,a.print_template,a.print_qr,ch.image_public_id as character_image,c.slug as collection_slug
    from adventures a join collections c on c.id=a.collection_id left join characters ch on ch.id=a.character_id where a.id=$1`, [id])
  if (!a) notFound()
  const story = await loadStory(id)
  return <StoryEditor id={id} slug={a.slug} published={a.published} cloud={process.env.CLOUDINARY_CLOUD_NAME ?? ''} collectionTemplate={templateFor({ print_template: null, collection_slug: a.collection_slug })?.url ?? null}
    initial={{ title: a.title, description: a.description, minutes: a.minutes, cover: a.cover_public_id, character_image: a.character_image, print_template: a.print_template, print_qr: a.print_qr, mission: { title: a.mission.title ?? '', text: a.mission.text ?? '', tips: a.mission.tips ?? [] }, scenes: story.scenes }} />
}
