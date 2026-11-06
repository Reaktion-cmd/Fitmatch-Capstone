-- ============================================================
-- FITMATCH
-- Migración: radio de búsqueda de deportistas
-- Fecha: 2026-10-02
-- ============================================================
--
-- Valores permitidos:
--
-- 5  = 5 km
-- 10 = 10 km
-- 25 = 25 km
-- 50 = 50 km
-- 0  = sin límite
--
-- Valor por defecto:
-- 25 km
-- ============================================================


-- ============================================================
-- 1. AGREGAR RADIO DE BÚSQUEDA
-- ============================================================

alter table public.profiles
add column if not exists search_radius_km integer
not null
default 25;


-- ============================================================
-- 2. RESTRICCIÓN DE VALORES PERMITIDOS
-- ============================================================

alter table public.profiles
drop constraint if exists profiles_search_radius_km_check;


alter table public.profiles
add constraint profiles_search_radius_km_check
check (
  search_radius_km in (
    0,
    5,
    10,
    25,
    50
  )
);