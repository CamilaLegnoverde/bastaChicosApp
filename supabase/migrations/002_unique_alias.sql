-- ============================================================
-- Migración: alias de pago único
--
-- El alias pasa a identificar al usuario al ingresar, así que no
-- pueden existir dos perfiles con el mismo alias (case-insensitive).
-- El alias vacío ('') no cuenta para la unicidad.
--
-- Si este insert falla por duplicados existentes, primero revisá:
--   select lower(alias_mp), count(*) from profiles
--   where alias_mp <> '' group by 1 having count(*) > 1;
-- ============================================================

create unique index if not exists uq_profiles_alias
  on profiles (lower(alias_mp)) where alias_mp <> '';
