import { z } from 'zod'
export const ScriptOut = z.object({
  title: z.string(), tips: z.array(z.string()).min(1).max(5),
  scenes: z.array(z.object({ start: z.number().int().min(0), end: z.number().int().positive(), say: z.string(), shot: z.string(), on_screen: z.string(),
    editing: z.object({ text_position: z.string().min(10), text_timing: z.string().min(10), emphasis: z.string().min(10), transition: z.string().min(10), sound: z.string().min(10) }),
  })).min(3).max(12),
})
export function checkScript(o: { title?: string; tips?: string[]; scenes: { start: number; end: number; say: string }[] }, duration: number) {
  let end = 0
  for (const scene of o.scenes) {
    if (scene.start !== end || scene.end <= scene.start || scene.end > duration) throw new Error('Las escenas deben cubrir la duración elegida, sin huecos ni superposiciones.')
    const words = scene.say.trim().split(/\s+/).filter(Boolean).length
    if (words > (scene.end - scene.start) * 3) throw new Error('Demasiadas palabras para el tiempo de la escena; acorta lo que se dice.')
    end = scene.end
  }
  if (end !== duration) throw new Error('El guion debe terminar en la duración elegida.')
}
