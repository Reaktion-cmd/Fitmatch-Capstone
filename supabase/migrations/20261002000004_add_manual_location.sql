-- ============================================================
-- FITMATCH
-- Migración: ubicación manual como alternativa al GPS
-- Fecha: 2026-10-02
-- ============================================================


-- ============================================================
-- 1. UBICACIÓN MANUAL EN PROFILES
-- ============================================================

alter table public.profiles
add column if not exists manual_location text;


alter table public.profiles
add column if not exists location_preference text
not null
default 'none';


-- ============================================================
-- 2. VALORES PERMITIDOS
-- ============================================================

alter table public.profiles
drop constraint if exists profiles_location_preference_check;


alter table public.profiles
add constraint profiles_location_preference_check
check (
  location_preference in (
    'none',
    'gps',
    'manual'
  )
);


-- ============================================================
-- 3. USUARIOS QUE YA TENÍAN UBICACIÓN GPS
-- ============================================================

update public.profiles as p
set location_preference = 'gps'
where exists (
  select 1
  from public.profile_locations as pl
  where pl.user_id = p.id
)
and p.location_preference = 'none';


-- ============================================================
-- 4. FUNCIÓN SEGURA DE DISTANCIAS
-- ============================================================
--
-- Solo calcula distancias entre usuarios que actualmente
-- utilizan GPS.
--
-- Una ubicación manual no se convierte en coordenadas falsas.
-- ============================================================

create or replace function public.get_profile_distances()
returns table (
  target_id uuid,
  distance_km double precision
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_lat double precision;
  v_user_lon double precision;
begin

  v_user_id := auth.uid();


  if v_user_id is null then
    return;
  end if;


  -- Ubicación GPS del usuario actual.

  select
    pl.latitude,
    pl.longitude

  into
    v_user_lat,
    v_user_lon

  from public.profile_locations pl

  join public.profiles p
    on p.id = pl.user_id

  where
    pl.user_id = v_user_id
    and p.location_preference = 'gps';


  -- Sin GPS activo no existe distancia exacta.

  if
    v_user_lat is null
    or v_user_lon is null
  then
    return;
  end if;


  -- Calcular distancia mediante Haversine.

  return query

  select
    pl.user_id as target_id,

    round(
      (
        6371 *
        acos(
          least(
            1.0,
            greatest(
              -1.0,

              cos(radians(v_user_lat))
              *
              cos(radians(pl.latitude))
              *
              cos(
                radians(pl.longitude)
                -
                radians(v_user_lon)
              )
              +
              sin(radians(v_user_lat))
              *
              sin(radians(pl.latitude))
            )
          )
        )
      )::numeric,
      1
    )::double precision

  from public.profile_locations pl

  join public.profiles p
    on p.id = pl.user_id

  where
    pl.user_id <> v_user_id
    and p.location_preference = 'gps';

end;
$$;


-- ============================================================
-- 5. PERMISOS
-- ============================================================

revoke all
on function public.get_profile_distances()
from public;


grant execute
on function public.get_profile_distances()
to authenticated;