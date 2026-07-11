-- ============================================================
-- Migración: tiempo real para las tablas hangouts y hangout_members
--
-- Supabase Realtime emite eventos por websocket sólo para las
-- tablas incluidas en la publicación `supabase_realtime`.
-- La app se suscribe a INSERT/UPDATE de hangouts y a cambios de
-- hangout_members para refrescar la pantalla de reuniones en
-- todos los clientes cuando se crea o edita una juntada.
-- ============================================================

do $$
begin
  alter publication supabase_realtime add table hangouts;
exception
  when duplicate_object then null; -- ya estaba agregada
end $$;

do $$
begin
  alter publication supabase_realtime add table hangout_members;
exception
  when duplicate_object then null; -- ya estaba agregada
end $$;
