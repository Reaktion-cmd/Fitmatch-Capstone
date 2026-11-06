-- ============================================================
-- FITMATCH
-- Migración: foto de perfil + preferencias de match
-- Fecha: 2026-11-04
-- ============================================================
--
-- 1. avatar_url : URL pública de la foto de perfil en Storage
-- 2. age_min / age_max : rango de edad para hacer match
-- 3. search_radius_km : se liberaliza el check para permitir
--    cualquier valor entre 0 y 500 km (antes solo 0/5/10/25/50)
-- 4. bucket 'avatars' en Supabase Storage (público)
--    + políticas RLS para que cada usuario gestione su carpeta
-- ============================================================


-- ============================================================
-- 1. FOTO DE PERFIL
-- ============================================================

alter table public.profiles
add column if not exists avatar_url text;


-- ============================================================
-- 2. PREFERENCIAS DE MATCH (EDAD)
-- ============================================================

alter table public.profiles
add column if not exists age_min integer not null default 18;

alter table public.profiles
add column if not exists age_max integer not null default 60;

alter table public.profiles
drop constraint if exists profiles_age_range_check;

alter table public.profiles
add constraint profiles_age_range_check
check (
  age_min >= 16
  and age_max <= 100
  and age_min <= age_max
);


-- ============================================================
-- 3. RADIO DE BÚSQUEDA CONTINUO (0 - 500 KM)
-- ============================================================

-- Si aún no existe la columna (instalación desde cero), crearla.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'search_radius_km'
  ) then
    alter table public.profiles
    add column search_radius_km integer not null default 25;
  end if;
end
$$;


alter table public.profiles
drop constraint if exists profiles_search_radius_km_check;


alter table public.profiles
add constraint profiles_search_radius_km_check
check (
  search_radius_km between 0 and 500
);


-- ============================================================
-- 4. BUCKET DE AVATARES EN SUPABASE STORAGE
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;


-- ============================================================
-- 5. POLÍTICAS RLS PARA EL BUCKET 'avatars'
--    (estructura de rutas: <user_id>/<archivo>)
-- ============================================================

drop policy if exists "avatars_select_public" on storage.objects;

create policy "avatars_select_public"
on storage.objects
for select
using (
  bucket_id = 'avatars'
);


drop policy if exists "avatars_insert_owner" on storage.objects;

create policy "avatars_insert_owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "avatars_update_owner" on storage.objects;

create policy "avatars_update_owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists "avatars_delete_owner" on storage.objects;

create policy "avatars_delete_owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
