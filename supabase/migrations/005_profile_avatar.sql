-- ============================================================
-- Migración: foto de perfil (blob) en profiles
--
-- Guarda la imagen de perfil como un blob real dentro de la base
-- (columna bytea) junto con su tipo MIME. La app la sube reducida
-- (canvas → JPEG/WebP chico) para no inflar la base, y en el cliente
-- reconstruye la imagen como data URL para mostrarla.
--
-- Cómo aplicarlo:
--   Dashboard de Supabase → SQL Editor → pegar este archivo → Run
-- ============================================================

alter table profiles
  add column if not exists avatar_blob bytea,
  add column if not exists avatar_mime text;
