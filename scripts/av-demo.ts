// Solo desarrollo: crea capítulos de prueba en Fantasmín, la publica y genera un código de kit.
// Uso: DATABASE_URL=postgres://...@127.0.0.1:5433/tendy npx tsx scripts/av-demo.ts [public_id_de_video]
import { q } from '../lib/db'
import { newCode } from '../lib/av-codes'

async function main() {
  if (!/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL ?? '')) throw new Error('Solo contra la BD local')
  const video = process.argv[2] ?? 'samples/elephants'
  const [a] = await q<{ id: string }>(`select id from adventures where slug='fantasmin'`)
  await q(`delete from story_scenes where adventure_id=$1`, [a.id])
  const ins = (title: string, pos: number, extra = '') => q<{ id: string }>(
    `insert into story_scenes(adventure_id,title,video_public_id,description,position${extra ? ',is_ending' : ''}) values($1,$2,$3,$4,$5${extra ? ',true' : ''}) returning id`,
    [a.id, title, video, `${title}: ¡Hola, pequeño artista! Soy Fantasmín.`, pos])
  const [c1] = await ins('El bosque encantado', 0)
  const [c2] = await ins('Entrar al bosque', 1, 'end')
  const [c3] = await ins('La casa encantada', 2)
  await q(`insert into story_choices(scene_id,label,next_scene_id,position) values($1,'🌲 Entrar al bosque',$2,0),($1,'🏚 Visitar la casa encantada',$3,1)`, [c1.id, c2.id, c3.id])
  await q(`update adventures set published=true where id=$1`, [a.id])
  const code = newCode()
  await q(`insert into qr_codes(code,adventure_id,batch) values($1,$2,'demo')`, [code, a.id])
  console.log(`Listo. Kit: /k/${code}`)
  process.exit(0)
}
main()
