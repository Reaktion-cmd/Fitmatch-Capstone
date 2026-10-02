-- ============================================================
-- FitMatch
-- Migración: Deportes y nivel de juego en perfiles
-- Fecha: 2026-10-02
-- ============================================================
--
-- Agrega a la tabla public.profiles:
--
-- sports:
--   Lista de deportes seleccionados por el usuario.
--   Ejemplo: {futbol,padel,running}
--
-- skill_level:
--   Nivel de juego seleccionado por el usuario.
--   Valores actuales:
--   Principiante
--   Intermedio
--   Avanzado
--
-- IF NOT EXISTS permite que la migración no falle si estas
-- columnas ya existen en la base de datos.
-- ============================================================

alter table public.profiles
add column if not exists sports text[] not null default '{}',
add column if not exists skill_level text;