-- ============================================================
-- FitMatch
-- Migración: Sistema de Likes, Pass y Matches
-- Fecha: 2026-10-02
-- ============================================================
--
-- Crea:
--
-- public.profile_swipes
--   Guarda decisiones like / pass entre usuarios.
--
-- public.matches
--   Guarda Matches cuando dos usuarios se dan Like mutuamente.
--
-- También:
-- - Permite consultar perfiles para el sistema de Match.
-- - Configura Row Level Security.
-- - Crea la función register_swipe().
-- ============================================================


-- ============================================================
-- 1. PERMITIR VER PERFILES PARA MATCH
-- ============================================================

drop policy if exists
"Usuarios autenticados pueden ver perfiles para match"
on public.profiles;

create policy
"Usuarios autenticados pueden ver perfiles para match"
on public.profiles
for select
to authenticated
using (true);


-- ============================================================
-- 2. TABLA DE SWIPES
-- ============================================================

create table if not exists public.profile_swipes (
  swiper_id uuid not null
    references auth.users(id)
    on delete cascade,

  target_id uuid not null
    references auth.users(id)
    on delete cascade,

  decision text not null
    check (
      decision in ('like', 'pass')
    ),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  primary key (
    swiper_id,
    target_id
  ),

  constraint profile_swipes_no_self
    check (
      swiper_id <> target_id
    )
);


-- ============================================================
-- 3. TABLA DE MATCHES
-- ============================================================

create table if not exists public.matches (
  id uuid primary key
    default gen_random_uuid(),

  user_a uuid not null
    references auth.users(id)
    on delete cascade,

  user_b uuid not null
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null
    default now(),

  constraint matches_no_self
    check (
      user_a <> user_b
    )
);


create unique index if not exists
matches_unique_pair_idx
on public.matches (
  user_a,
  user_b
);


-- ============================================================
-- 4. ACTIVAR ROW LEVEL SECURITY
-- ============================================================

alter table public.profile_swipes
enable row level security;

alter table public.matches
enable row level security;


-- ============================================================
-- 5. POLÍTICA DE SWIPES
-- ============================================================

drop policy if exists
"Usuarios pueden ver sus propios swipes"
on public.profile_swipes;

create policy
"Usuarios pueden ver sus propios swipes"
on public.profile_swipes
for select
to authenticated
using (
  auth.uid() = swiper_id
);


-- ============================================================
-- 6. POLÍTICA DE MATCHES
-- ============================================================

drop policy if exists
"Usuarios pueden ver sus propios matches"
on public.matches;

create policy
"Usuarios pueden ver sus propios matches"
on public.matches
for select
to authenticated
using (
  auth.uid() = user_a
  or
  auth.uid() = user_b
);


-- ============================================================
-- 7. FUNCIÓN PARA REGISTRAR LIKE / PASS
-- ============================================================

create or replace function public.register_swipe(
  p_target_id uuid,
  p_decision text
)
returns table (
  is_match boolean,
  match_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_match_id uuid;
begin

  v_user_id := auth.uid();


  if v_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;


  if v_user_id = p_target_id then
    raise exception 'No puedes deslizar tu propio perfil';
  end if;


  if p_decision not in ('like', 'pass') then
    raise exception 'Decisión inválida';
  end if;


  if not exists (
    select 1
    from auth.users
    where id = p_target_id
  ) then
    raise exception 'Usuario objetivo no encontrado';
  end if;


  -- Guardar o actualizar la decisión.

  insert into public.profile_swipes (
    swiper_id,
    target_id,
    decision
  )
  values (
    v_user_id,
    p_target_id,
    p_decision
  )
  on conflict (
    swiper_id,
    target_id
  )
  do update set
    decision = excluded.decision,
    updated_at = now();


  -- Un Pass nunca genera Match.

  if p_decision = 'pass' then
    return query
    select
      false,
      null::uuid;

    return;
  end if;


  -- Comprobar Like mutuo.

  if exists (
    select 1
    from public.profile_swipes
    where
      swiper_id = p_target_id
      and target_id = v_user_id
      and decision = 'like'
  ) then

    -- Ordenar UUID para que A+B y B+A
    -- representen el mismo Match.

    if v_user_id::text < p_target_id::text then
      v_user_a := v_user_id;
      v_user_b := p_target_id;
    else
      v_user_a := p_target_id;
      v_user_b := v_user_id;
    end if;


    insert into public.matches (
      user_a,
      user_b
    )
    values (
      v_user_a,
      v_user_b
    )
    on conflict (
      user_a,
      user_b
    )
    do nothing
    returning id
    into v_match_id;


    if v_match_id is null then
      select id
      into v_match_id
      from public.matches
      where
        user_a = v_user_a
        and user_b = v_user_b;
    end if;


    return query
    select
      true,
      v_match_id;

    return;
  end if;


  -- Like registrado, pero todavía sin Match.

  return query
  select
    false,
    null::uuid;

end;
$$;


-- ============================================================
-- 8. PERMISOS DE LA FUNCIÓN
-- ============================================================

revoke all
on function public.register_swipe(uuid, text)
from public;

grant execute
on function public.register_swipe(uuid, text)
to authenticated;