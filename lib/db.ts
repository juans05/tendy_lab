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
  await pool.query(SCHEMA)
}
