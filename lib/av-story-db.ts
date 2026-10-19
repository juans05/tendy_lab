import { q } from './db'
import type { Story } from './av-story'

export async function loadStory(adventureId: string): Promise<Story> {
  const scenes = await q<{ id: string; title: string; video_public_id: string; description: string | null; image_public_id: string | null; next_scene_id: string | null; is_ending: boolean }>(
    `select id,title,video_public_id,description,image_public_id,next_scene_id,is_ending from story_scenes where adventure_id=$1 order by position,id`, [adventureId])
  const choices = await q<{ scene_id: string; label: string; next_scene_id: string }>(
    `select c.scene_id,c.label,c.next_scene_id from story_choices c join story_scenes s on s.id=c.scene_id where s.adventure_id=$1 order by c.position,c.id`, [adventureId])
  return { scenes: scenes.map(s => ({
    id: String(s.id), title: s.title, video: s.video_public_id, description: s.description, image: s.image_public_id,
    next: s.next_scene_id ? String(s.next_scene_id) : null, ending: s.is_ending,
    choices: choices.filter(c => String(c.scene_id) === String(s.id)).map(c => ({ label: c.label, next: String(c.next_scene_id) })),
  })) }
}
