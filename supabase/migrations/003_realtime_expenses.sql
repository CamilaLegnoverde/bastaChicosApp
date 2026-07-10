-- ============================================================
-- Migración: tiempo real para la tabla expenses
--
-- Supabase Realtime emite eventos por websocket sólo para las
-- tablas incluidas en la publicación `supabase_realtime`.
-- La app se suscribe a INSERT/UPDATE de expenses para refrescar
-- la pantalla de gastos de una juntada en todos los clientes.
-- ============================================================

do $$
begin
  alter publication supabase_realtime add table expenses;
exception
  when duplicate_object then null; -- ya estaba agregada
end $$;
