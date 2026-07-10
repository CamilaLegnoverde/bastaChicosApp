-- ============================================================
-- Migración: amistades unidireccionales → mutuas (registro único)
--
-- Sólo para bases que ya tienen la tabla friendships vieja
-- (columnas user_id / friend_id). Si vas a crear la base desde
-- cero, usá directamente supabase/schema.sql y omití este archivo.
--
-- Convierte cada par (A→B) y (B→A) en una única fila normalizada
-- (user_a < user_b), deduplicando automáticamente.
-- ============================================================

begin;

create table friendships_new (
  user_a     text not null references profiles (id) on delete cascade,
  user_b     text not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

insert into friendships_new (user_a, user_b, created_at)
select
  least(user_id, friend_id),
  greatest(user_id, friend_id),
  min(created_at)
from friendships
where user_id <> friend_id
group by least(user_id, friend_id), greatest(user_id, friend_id);

drop table friendships;
alter table friendships_new rename to friendships;

create index if not exists idx_friendships_user_b on friendships (user_b);

alter table friendships enable row level security;
drop policy if exists "anon full access" on friendships;
create policy "anon full access" on friendships for all using (true) with check (true);

commit;
