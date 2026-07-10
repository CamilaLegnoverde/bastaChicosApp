-- ============================================================
-- Migración: tabla settlements (transferencias realizadas)
--
-- Guarda los pagos que los integrantes marcan como transferidos
-- desde el detalle de la liquidación. Los balances descuentan
-- estos pagos, así las transferencias pendientes se recalculan.
-- ============================================================

create table if not exists settlements (
  id         text primary key,
  hangout_id text not null references hangouts (id) on delete cascade,
  from_id    text not null references profiles (id), -- quién pagó
  to_id      text not null references profiles (id), -- quién recibió
  amount     numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_settlements_hangout on settlements (hangout_id);

alter table settlements enable row level security;
drop policy if exists "anon full access" on settlements;
create policy "anon full access" on settlements for all using (true) with check (true);
