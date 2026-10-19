import pg from 'pg'

const g = globalThis as any
// Acepta DATABASE_URL (Railway) o las variables DB_* (.env). Todo vive en un schema propio (DB_SCHEMA).
const SCHEMA_NAME = process.env.DB_SCHEMA || 'public'
const conn = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME }
export const pool: pg.Pool = (g.__pool ??= new pg.Pool({
  ...conn,
  max: 10,
  options: `-c search_path="${SCHEMA_NAME.replace(/"/g, '')}"`,
  ssl: process.env.DB_SSL === 'true' || process.env.PGSSL ? true : undefined, // verificado
}))

export async function q<T = any>(sql: string, p: any[] = []): Promise<T[]> {
  await migrate()
  return (await pool.query(sql, p)).rows
}

export async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  await migrate()
  const c = await pool.connect()
  try {
    await c.query('begin')
    const r = await fn(c)
    await c.query('commit')
    return r
  } catch (e) {
    await c.query('rollback')
    throw e
  } finally {
    c.release()
  }
}

// Postgres hace todo: usuarios, sesiones, cola (runs), ledger de monedas y archivos (bytea).
// ponytail: archivos en bytea (tope ~100 MB por archivo); mover a R2/S3 si el volumen crece.
const SCHEMA = `
create table if not exists users(
  id bigserial primary key, email text unique not null, pass text not null,
  is_admin boolean not null default false, brand jsonb not null default '{}',
  created_at timestamptz not null default now());
create table if not exists sessions(
  token_hash text primary key, user_id bigint not null references users on delete cascade,
  expires_at timestamptz not null);
create table if not exists ledger(
  id bigserial primary key, user_id bigint not null references users on delete cascade,
  run_id bigint, type text not null, amount int not null, note text, idem text unique,
  created_at timestamptz not null default now());
create index if not exists ledger_user on ledger(user_id);
create table if not exists assets(
  id bigserial primary key, user_id bigint not null references users on delete cascade,
  mime text not null, name text, data bytea not null, created_at timestamptz not null default now());
create table if not exists runs(
  id bigserial primary key, user_id bigint not null references users on delete cascade,
  tool text not null, status text not null default 'QUEUED', input jsonb not null, result jsonb,
  error text, cost int not null, started_at timestamptz, finished_at timestamptz,
  created_at timestamptz not null default now());
create index if not exists runs_queue on runs(status, id);
create index if not exists runs_user on runs(user_id, id desc);
create table if not exists products(
  id bigserial primary key, user_id bigint not null references users on delete cascade,
  name text not null, data jsonb not null default '{}', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());
create index if not exists products_user on products(user_id,id desc);
create table if not exists order_links(
  token text primary key, user_id bigint not null references users on delete cascade,
  product_name text not null, price bigint not null check(price>0), currency text not null,
  active boolean not null default true, created_at timestamptz not null default now());
create table if not exists brand_logos(
  user_id bigint primary key references users on delete cascade, data bytea not null,
  updated_at timestamptz not null default now());
create table if not exists customer_orders(
  id bigserial primary key, link_token text not null references order_links,
  customer_name text not null, phone text not null, address text not null,
  quantity int not null check(quantity between 1 and 100), unit_price bigint not null,
  status text not null default 'Nuevo', receipt text unique not null,
  created_at timestamptz not null default now());
alter table order_links add column if not exists page jsonb;
alter table order_links add column if not exists photos bytea[];
alter table order_links add column if not exists video bytea;
alter table order_links add column if not exists video_mime text;
create table if not exists content_plans(
  id bigserial primary key, user_id bigint not null references users on delete cascade,
  product_id bigint references products on delete set null, name text not null default 'Mi semana',
  platform text not null, objective text not null, days int not null check(days between 1 and 7),
  auto boolean not null default false, description text not null default '', voice_text text,
  visual_spec text not null default '', context text not null default '',
  created_at timestamptz not null default now());
create index if not exists content_plans_user on content_plans(user_id, id desc);
create table if not exists plan_weeks(
  id bigserial primary key, plan_id bigint not null references content_plans on delete cascade,
  n int not null, run_id bigint not null, start date not null, done int[] not null default '{}',
  unique(plan_id, n));
`

// Tendy Aventuras: cuentos en video por QR de kit. Fotos de niños cifradas (AES-256-GCM), nunca públicas.
// Sin datos del niño ni del adulto: el par código de kit + PIN reemplaza a las cuentas.
const AVENTURAS = `
create table if not exists collections(
  id bigserial primary key, slug text unique not null, name text not null,
  theme jsonb not null default '{}', active boolean not null default true);
create table if not exists characters(
  id bigserial primary key, collection_id bigint not null references collections, slug text unique not null,
  name text not null, image_public_id text, active boolean not null default true);
create table if not exists adventures(
  id bigserial primary key,
  slug text unique not null check(slug ~ '^[a-z0-9-]+$' and slug not in ('mis-fotos','privacidad')),
  collection_id bigint not null references collections, character_id bigint references characters,
  title text not null, description text not null, cover_public_id text, minutes int not null default 5,
  mission jsonb not null default '{}', published boolean not null default false,
  updated_at timestamptz not null default now());
create table if not exists story_scenes(
  id bigserial primary key, adventure_id bigint not null references adventures on delete cascade,
  title text not null, video_public_id text not null, description text, image_public_id text,
  next_scene_id bigint references story_scenes on delete set null,
  is_ending boolean not null default false, position int not null);
create index if not exists story_scenes_adv on story_scenes(adventure_id, position);
create table if not exists story_choices(
  id bigserial primary key, scene_id bigint not null references story_scenes on delete cascade,
  label text not null, next_scene_id bigint not null references story_scenes on delete cascade,
  position int not null default 0);
create index if not exists story_choices_scene on story_choices(scene_id);
create table if not exists qr_codes(
  id bigserial primary key, code text unique not null, adventure_id bigint not null references adventures,
  batch text not null, pin_hash text, pin_fails int not null default 0, locked_until timestamptz,
  created_at timestamptz not null default now());
create index if not exists qr_codes_batch on qr_codes(batch);
create table if not exists adventure_events(
  id bigserial primary key, adventure_id bigint not null references adventures on delete cascade,
  qr_code_id bigint references qr_codes on delete set null,
  type text not null check(type in ('scan','start','complete','diploma','upload','whatsapp')),
  created_at timestamptz not null default now());
create index if not exists adventure_events_adv on adventure_events(adventure_id, created_at);
create index if not exists adventure_events_qr on adventure_events(qr_code_id);
create table if not exists media_files(
  id uuid primary key default gen_random_uuid(), qr_code_id bigint not null references qr_codes on delete cascade,
  mime text not null, bytes int not null, iv bytea not null, tag bytea not null, data bytea not null,
  moderation text not null default 'pending' check(moderation in ('pending','approved','rejected')),
  delete_after timestamptz not null, created_at timestamptz not null default now());
create index if not exists media_files_qr on media_files(qr_code_id);
create index if not exists media_files_expiry on media_files(delete_after);
create table if not exists consent_records(
  id bigserial primary key, qr_code_id bigint not null references qr_codes on delete cascade,
  media_file_id uuid not null references media_files on delete cascade,
  purpose text not null check(purpose in ('store','gallery','ads')), version text not null,
  granted_at timestamptz not null default now(), revoked_at timestamptz);
create index if not exists consent_records_media on consent_records(media_file_id);
create table if not exists album_sessions(
  token_hash text primary key, qr_code_id bigint not null references qr_codes on delete cascade,
  expires_at timestamptz not null);
create table if not exists av_settings(key text primary key, value jsonb not null);
create table if not exists admin_audit(
  id bigserial primary key, user_id bigint not null references users, action text not null, target text,
  created_at timestamptz not null default now());
insert into collections(slug,name,theme) values('halloween','Tendy Halloween','{"bg":"#461577"}') on conflict (slug) do nothing;
insert into characters(collection_id,slug,name) select id,'fantasmin','Fantasmín' from collections where slug='halloween'
  on conflict (slug) do nothing;
insert into adventures(slug,collection_id,character_id,title,description,mission)
  select 'fantasmin', c.id, ch.id, 'El misterio del fantasmita sin color',
    'Algo extraño ocurrió en el bosque encantado. Fantasmín ha perdido sus colores y solamente un pequeño artista puede ayudarlo.',
    '{"title":"¡Ahora empieza tu misión!","text":"Toma tu figura de yeso y utiliza tus pinturas para devolverle la magia a Fantasmín.","tips":["Pinta primero las partes grandes y luego los detalles.","Deja secar cada color antes de pintar el de al lado.","¡Inventa tus propios colores mágicos!"]}'
  from collections c join characters ch on ch.slug='fantasmin' where c.slug='halloween'
  on conflict (slug) do nothing;
`
let migration: Promise<void> | undefined
export function migrate(): Promise<void> {
  // También al recargar este módulo en desarrollo: la instrumentación solo corre al iniciar.
  return migration ??= applySchema().catch(error => {
    migration = undefined
    throw error
  })
}
async function applySchema() {
  const name = SCHEMA_NAME.replace(/"/g, '')
  if (name !== 'public') await pool.query(`create schema if not exists "${name}"`)
  await pool.query(SCHEMA + AVENTURAS)
}
