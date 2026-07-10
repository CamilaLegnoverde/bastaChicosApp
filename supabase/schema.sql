-- ============================================================
-- Vaqui — Esquema de base de datos para Supabase
--
-- Cómo aplicarlo:
--   Dashboard de Supabase → SQL Editor → pegar este archivo → Run
--   (o `supabase db push` si usás la CLI con migraciones)
--
-- Nota: la app no usa Supabase Auth (la identidad es un perfil
-- creado con el nombre). Por eso las políticas RLS son abiertas
-- para el rol anon — apto para demo/prototipo. Si más adelante
-- agregás Auth, reemplazá las políticas por unas basadas en auth.uid().
-- ============================================================

-- ---------- Tablas ----------

-- Personas (el usuario y sus amigos comparten esta tabla)
create table if not exists profiles (
  id           text primary key,
  name         text not null,
  alias_mp     text not null default '',
  cbu          text,
  cvu          text,
  code         text not null unique,
  avatar_color text not null default 'bg-violet-500',
  avatar_blob  bytea,        -- foto de perfil como blob (opcional)
  avatar_mime  text,         -- tipo MIME de la foto (ej: 'image/jpeg')
  created_at   timestamptz not null default now()
);

-- Relación de amistad MUTUA: un único registro por par de personas.
-- El par se guarda normalizado (user_a < user_b alfabéticamente), así
-- nunca pueden existir dos filas para la misma amistad. Cuando A agrega
-- a B, ambos quedan conectados automáticamente.
create table if not exists friendships (
  user_a     text not null references profiles (id) on delete cascade,
  user_b     text not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

-- Juntadas
create table if not exists hangouts (
  id          text primary key,
  emoji       text not null default '✨',
  title       text not null,
  date        text not null default '', -- ISO 'YYYY-MM-DD' (o texto legado)
  description text not null default '',
  status      text not null default 'proxima' check (status in ('proxima', 'finalizada')),
  created_by  text not null references profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Integrantes de cada juntada
create table if not exists hangout_members (
  hangout_id text not null references hangouts (id) on delete cascade,
  profile_id text not null references profiles (id) on delete cascade,
  primary key (hangout_id, profile_id)
);

-- Gastos de una juntada
create table if not exists expenses (
  id          text primary key,
  hangout_id  text not null references hangouts (id) on delete cascade,
  emoji       text not null default '💸',
  description text not null,
  amount      numeric(12, 2) not null check (amount > 0),
  paid_by     text not null references profiles (id),
  created_at  timestamptz not null default now()
);

-- Entre quiénes se divide cada gasto
create table if not exists expense_splits (
  expense_id text not null references expenses (id) on delete cascade,
  profile_id text not null references profiles (id) on delete cascade,
  primary key (expense_id, profile_id)
);

-- Transferencias marcadas como realizadas (pagos registrados)
create table if not exists settlements (
  id         text primary key,
  hangout_id text not null references hangouts (id) on delete cascade,
  from_id    text not null references profiles (id), -- quién pagó
  to_id      text not null references profiles (id), -- quién recibió
  amount     numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- ---------- Índices ----------

-- El PK ya indexa user_a; este índice cubre las búsquedas por user_b
create index if not exists idx_friendships_user_b   on friendships (user_b);

-- El alias identifica al usuario al ingresar: único (ignorando mayúsculas)
-- entre quienes lo tienen cargado. El alias vacío no cuenta.
create unique index if not exists uq_profiles_alias
  on profiles (lower(alias_mp)) where alias_mp <> '';
create index if not exists idx_hangout_members_prof on hangout_members (profile_id);
create index if not exists idx_expenses_hangout     on expenses (hangout_id);
create index if not exists idx_expense_splits_exp   on expense_splits (expense_id);
create index if not exists idx_settlements_hangout  on settlements (hangout_id);

-- ---------- Realtime ----------
-- Habilita eventos por websocket para los gastos (la app refresca la
-- pantalla de gastos de una juntada en tiempo real para todos).

do $$
begin
  alter publication supabase_realtime add table expenses;
exception
  when duplicate_object then null; -- ya estaba agregada
end $$;

-- ---------- Row Level Security (demo: acceso anon abierto) ----------

alter table profiles        enable row level security;
alter table friendships     enable row level security;
alter table hangouts        enable row level security;
alter table hangout_members enable row level security;
alter table expenses        enable row level security;
alter table expense_splits  enable row level security;
alter table settlements     enable row level security;

drop policy if exists "anon full access" on profiles;
create policy "anon full access" on profiles        for all using (true) with check (true);
drop policy if exists "anon full access" on friendships;
create policy "anon full access" on friendships     for all using (true) with check (true);
drop policy if exists "anon full access" on hangouts;
create policy "anon full access" on hangouts        for all using (true) with check (true);
drop policy if exists "anon full access" on hangout_members;
create policy "anon full access" on hangout_members for all using (true) with check (true);
drop policy if exists "anon full access" on expenses;
create policy "anon full access" on expenses        for all using (true) with check (true);
drop policy if exists "anon full access" on expense_splits;
create policy "anon full access" on expense_splits  for all using (true) with check (true);
drop policy if exists "anon full access" on settlements;
create policy "anon full access" on settlements     for all using (true) with check (true);
