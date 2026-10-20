import { z } from 'zod'
import { q, tx } from './db'
import { validateStory, type Story } from './av-story'

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

// Lo que envía el editor del admin. Capítulos nuevos llegan con id temporal (no numérico) y se resuelven aquí.
const pid = z.string().trim().max(255)
export const StoryInput = z.object({
  title: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(600),
  minutes: z.coerce.number().int().min(1).max(60), cover: pid.nullish(), character_image: pid.nullish(), print_template: pid.nullish(),
  print_qr: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), size: z.number().min(5).max(60) }).optional(),
  mission: z.object({ title: z.string().trim().max(120).optional(), text: z.string().trim().max(600).optional(), tips: z.array(z.string().trim().max(200)).max(8).optional() }),
  scenes: z.array(z.object({
    id: z.string().max(40), title: z.string().trim().max(160), video: pid, description: z.string().trim().max(1200).nullish(),
    image: pid.nullish(), next: z.string().max(40).nullish(), ending: z.boolean(),
    choices: z.array(z.object({ label: z.string().trim().min(1).max(80), next: z.string().max(40) })).max(3),
  })).max(60),
})
export type StoryInput = z.infer<typeof StoryInput>

export async function saveStory(adventureId: string, input: StoryInput): Promise<{ errors: string[]; warnings: string[]; unpublished: boolean }> {
  await tx(async c => {
    await c.query(`update adventures set title=$2,description=$3,minutes=$4,cover_public_id=$5,mission=$6,updated_at=now() where id=$1`,
      [adventureId, input.title, input.description, input.minutes, input.cover || null, input.mission])
    // Tarjeta para imprimir: plantilla de la aventura y dónde va el QR.
    if (input.print_template !== undefined) await c.query(`update adventures set print_template=$2 where id=$1`, [adventureId, input.print_template || null])
    if (input.print_qr) await c.query(`update adventures set print_qr=$2 where id=$1`, [adventureId, input.print_qr])
    // Imagen del personaje (portada, misión y diploma). Si la aventura no tiene personaje, se crea uno con su título.
    if (input.character_image !== undefined) {
      const [a] = (await c.query(`select character_id,collection_id,slug from adventures where id=$1`, [adventureId])).rows
      if (a.character_id) await c.query(`update characters set image_public_id=$2 where id=$1`, [a.character_id, input.character_image || null])
      else if (input.character_image) {
        const ch = await c.query(`insert into characters(collection_id,slug,name,image_public_id) values($1,$2,$3,$4)
          on conflict (slug) do update set image_public_id=excluded.image_public_id returning id`, [a.collection_id, `${a.slug}-personaje`, input.title, input.character_image])
        await c.query(`update adventures set character_id=$2 where id=$1`, [adventureId, ch.rows[0].id])
      }
    }
    const own = new Set((await c.query(`select id from story_scenes where adventure_id=$1`, [adventureId])).rows.map(r => String(r.id)))
    const real = new Map<string, string>() // id del editor -> id en BD
    for (const [i, s] of input.scenes.entries()) {
      const vals = [s.title, s.video, s.description || null, s.image || null, s.ending, i]
      if (own.has(s.id)) {
        await c.query(`update story_scenes set title=$2,video_public_id=$3,description=$4,image_public_id=$5,is_ending=$6,position=$7,next_scene_id=null where id=$1`, [s.id, ...vals])
        real.set(s.id, s.id)
      } else {
        const r = await c.query(`insert into story_scenes(adventure_id,title,video_public_id,description,image_public_id,is_ending,position) values($1,$2,$3,$4,$5,$6,$7) returning id`, [adventureId, ...vals])
        real.set(s.id, String(r.rows[0].id))
      }
    }
    await c.query(`delete from story_scenes where adventure_id=$1 and not (id = any($2::bigint[]))`, [adventureId, [...real.values()]])
    await c.query(`delete from story_choices where scene_id in (select id from story_scenes where adventure_id=$1)`, [adventureId])
    for (const s of input.scenes) {
      const id = real.get(s.id)!
      // Las referencias a capítulos que no existen se descartan: la validación avisará si falta algo.
      if (!s.choices.length && s.next && real.has(s.next)) await c.query(`update story_scenes set next_scene_id=$2 where id=$1`, [id, real.get(s.next)])
      for (const [j, ch] of s.choices.entries()) if (real.has(ch.next))
        await c.query(`insert into story_choices(scene_id,label,next_scene_id,position) values($1,$2,$3,$4)`, [id, ch.label, real.get(ch.next), j])
    }
  })
  const v = validateStory(await loadStory(adventureId))
  const unpublished = v.errors.length > 0 && (await q(`update adventures set published=false where id=$1 and published returning id`, [adventureId])).length > 0
  return { ...v, unpublished }
}
