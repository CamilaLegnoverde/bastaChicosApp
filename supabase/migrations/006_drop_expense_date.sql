-- ============================================================
-- Migración: eliminar la columna `date` de expenses
--
-- El "cuándo" de un gasto pasa a derivarse de `created_at` (timestamp),
-- que ya existía. La app muestra el tiempo relativo ("Hace unos
-- instantes", "Hace 5 min.") o la fecha y hora si es más viejo.
-- ============================================================

alter table expenses drop column if exists date;
