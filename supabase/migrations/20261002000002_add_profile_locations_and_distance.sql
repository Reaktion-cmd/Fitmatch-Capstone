-- ============================================================
-- FITMATCH
-- Migración: ubicación privada y cálculo de distancia
-- Fecha: 2026-10-02
-- ============================================================


-- ============================================================
-- 1. TABLA DE UBICACIONES
-- ============================================================

create table if not exists public.profile_locations (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  latitude double precision not null,

  longitude double precision not null,

  updated_at timestamptz not null
    default now(),

  constraint latitude_valid
    check (
      latitude >= -90
      and latitude <= 90
    ),

  constraint longitude_valid
    check (
      longitude >= -180
      and longitude <= 180
    )
);


-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

alter table public.profile_locations
enable row level security;


-- ============================================================
-- 3. VER UBICACIÓN PROPIA
-- ============================================================

drop policy if exists
"Usuarios pueden ver su propia ubicacion"
on public.profile_locations;

create policy
"Usuarios pueden ver su propia ubicacion"
on public.profile_locations
for select
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================================
-- 4. GUARDAR UBICACIÓN PROPIA
-- ============================================================

drop policy if exists
"Usuarios pueden guardar su propia ubicacion"
on public.profile_locations;

create policy
"Usuarios pueden guardar su propia ubicacion"
on public.profile_locations
for insert
to authenticated
with check (
  auth.uid() = user_id
);


-- ============================================================
-- 5. ACTUALIZAR UBICACIÓN PROPIA
-- ============================================================

drop policy if exists
"Usuarios pueden actualizar su propia ubicacion"
on public.profile_locations;

create policy
"Usuarios pueden actualizar su propia ubicacion"
on public.profile_locations
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


-- ============================================================
-- 6. FUNCIÓN SEGURA DE DISTANCIA
-- ============================================================
--
-- Devuelve únicamente:
--
-- target_id
-- distance_km
--
-- No expone coordenadas de otros usuarios.
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
  v_latitude double precision;
  v_longitude double precision;
begin

  v_user_id := auth.uid();


  if v_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;


  select
    latitude,
    longitude
  into
    v_latitude,
    v_longitude
  from public.profile_locations
  where user_id = v_user_id;


  if
    v_latitude is null
    or
    v_longitude is null
  then
    return;
  end if;


  return query

  select
    locations.user_id as target_id,

    round(
      (
        6371
        *
        2
        *
        asin(
          least(
            1.0,
            sqrt(
              power(
                sin(
                  radians(
                    locations.latitude - v_latitude
                  ) / 2
                ),
                2
              )
              +
              cos(
                radians(v_latitude)
              )
              *
              cos(
                radians(locations.latitude)
              )
              *
              power(
                sin(
                  radians(
                    locations.longitude - v_longitude
                  ) / 2
                ),
                2
              )
            )
          )
        )
      )::numeric,
      1
    )::double precision
    as distance_km

  from public.profile_locations as locations

  inner join public.profiles
    on profiles.id = locations.user_id

  where locations.user_id <> v_user_id;

end;
$$;


-- ============================================================
-- 7. PERMISOS
-- ============================================================

revoke all
on function public.get_profile_distances()
from public;


grant execute
on function public.get_profile_distances()
to authenticated;