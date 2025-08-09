/* eslint-disable no-console */
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const SQL = `
create table if not exists public.questions (
  id text primary key,
  assessment text,
  test text,
  domain text,
  skill text,
  difficulty text,
  number integer,
  stem text,
  choices jsonb,
  answer text,
  rationale text,
  images jsonb,
  pages jsonb,
  created_at timestamptz default now()
);

alter table public.questions add column if not exists assessment text;
alter table public.questions add column if not exists test text;
alter table public.questions add column if not exists domain text;
alter table public.questions add column if not exists skill text;
alter table public.questions add column if not exists difficulty text;
alter table public.questions add column if not exists number integer;
alter table public.questions add column if not exists stem text;
alter table public.questions add column if not exists choices jsonb;
alter table public.questions add column if not exists answer text;
alter table public.questions add column if not exists rationale text;
alter table public.questions add column if not exists images jsonb;
alter table public.questions add column if not exists pages jsonb;
alter table public.questions add column if not exists created_at timestamptz default now();

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.questions'::regclass and contype = 'p'
  ) then
    alter table public.questions add primary key (id);
  end if;
end $$;

alter table public.questions enable row level security;
`; 

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    console.log('🚀 Applying questions schema migration...');
    await client.query(SQL);
    console.log('✅ Migration complete');
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });



