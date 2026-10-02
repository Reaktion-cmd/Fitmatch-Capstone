-- ============================================================
-- FitMatch
-- Migración: Eventos deportivos y participantes
-- Fecha: 2026-10-02
-- ============================================================
--
-- Crea:
--
-- public.events
--   Guarda los eventos deportivos creados por los usuarios.
--
-- public.event_participants
--   Registra qué usuarios participan en cada evento.
--
-- También configura Row Level Security (RLS) y sus políticas.
-- ============================================================


-- ============================================================
-- 1. TABLA DE EVENTOS
-- ============================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text not null,

  sport text not null,

  location text not null,

  date_text text not null,

  slots integer not null
    check (slots > 0),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);


-- ============================================================
-- 2. TABLA DE PARTICIPANTES
-- ============================================================

create table if not exists public.event_participants (
  event_id uuid not null
    references public.events(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  joined_at timestamptz not null
    default now(),

  primary key (event_id, user_id)
);


-- ============================================================
-- 3. ACTIVAR ROW LEVEL SECURITY
-- ============================================================

alter table public.events
enable row level security;

alter table public.event_participants
enable row level security;


-- ============================================================
-- 4. POLÍTICAS PARA EVENTS
-- ============================================================

drop policy if exists
"Usuarios autenticados pueden ver eventos"
on public.events;

create policy
"Usuarios autenticados pueden ver eventos"
on public.events
for select
to authenticated
using (true);


drop policy if exists
"Usuarios pueden crear eventos"
on public.events;

create policy
"Usuarios pueden crear eventos"
on public.events
for insert
to authenticated
with check (
  auth.uid() = creator_id
);


drop policy if exists
"Usuarios pueden actualizar sus eventos"
on public.events;

create policy
"Usuarios pueden actualizar sus eventos"
on public.events
for update
to authenticated
using (
  auth.uid() = creator_id
)
with check (
  auth.uid() = creator_id
);


drop policy if exists
"Usuarios pueden eliminar sus eventos"
on public.events;

create policy
"Usuarios pueden eliminar sus eventos"
on public.events
for delete
to authenticated
using (
  auth.uid() = creator_id
);


-- ============================================================
-- 5. POLÍTICAS PARA PARTICIPANTES
-- ============================================================

drop policy if exists
"Usuarios autenticados pueden ver participantes"
on public.event_participants;

create policy
"Usuarios autenticados pueden ver participantes"
on public.event_participants
for select
to authenticated
using (true);


drop policy if exists
"Usuarios pueden inscribirse"
on public.event_participants;

create policy
"Usuarios pueden inscribirse"
on public.event_participants
for insert
to authenticated
with check (
  auth.uid() = user_id
);


drop policy if exists
"Usuarios pueden cancelar su participacion"
on public.event_participants;

create policy
"Usuarios pueden cancelar su participacion"
on public.event_participants
for delete
to authenticated
using (
  auth.uid() = user_id
);