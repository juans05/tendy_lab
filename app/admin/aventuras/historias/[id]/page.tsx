import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { q } from '@/lib/db'
import { loadStory } from '@/lib/av-story-db'
import { StoryEditor } from '@/lib/av-scene-editor'

export default async function Editor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const [a] = await q(`select a.id,a.slug,a.title,a.description,a.minutes,a.cover_public_id,a.mission,a.published,ch.image_public_id as character_image
    from adventures a left join characters ch on ch.id=a.character_id where a.id=$1`, [id])
  if (!a) notFound()
  const story = await loadStory(id)
  return <StoryEditor id={id} slug={a.slug} published={a.published} cloud={process.env.CLOUDINARY_CLOUD_NAME ?? ''}
    initial={{ title: a.title, description: a.description, minutes: a.minutes, cover: a.cover_public_id, character_image: a.character_image, mission: { title: a.mission.title ?? '', text: a.mission.text ?? '', tips: a.mission.tips ?? [] }, scenes: story.scenes }} />
}
