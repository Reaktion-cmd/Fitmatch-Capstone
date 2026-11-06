-- ============================================================
-- FITMATCH
-- Migración: mensajes privados entre usuarios con Match
-- Fecha: 2026-10-02
-- ============================================================


-- ============================================================
-- 1. TABLA DE MENSAJES
-- ============================================================

create table if not exists public.messages (
  id uuid primary key
    default gen_random_uuid(),

  match_id uuid not null
    references public.matches(id)
    on delete cascade,

  sender_id uuid not null
    references auth.users(id)
    on delete cascade,

  content text not null
    check (
      char_length(trim(content)) > 0
      and char_length(content) <= 1000
    ),

  created_at timestamptz not null
    default now()
);


-- ============================================================
-- 2. ÍNDICE
-- ============================================================

create index if not exists
messages_match_created_at_idx
on public.messages (
  match_id,
  created_at
);


-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

alter table public.messages
enable row level security;


-- ============================================================
-- 4. LEER MENSAJES
-- ============================================================
-- Solo los usuarios pertenecientes al Match pueden leer
-- los mensajes de esa conversación.
-- ============================================================

drop policy if exists
"Usuarios pueden leer mensajes de sus matches"
on public.messages;

create policy
"Usuarios pueden leer mensajes de sus matches"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.matches
    where
      matches.id = messages.match_id
      and (
        matches.user_a = auth.uid()
        or
        matches.user_b = auth.uid()
      )
  )
);


-- ============================================================
-- 5. ENVIAR MENSAJES
-- ============================================================
-- El usuario autenticado debe ser el remitente y además
-- pertenecer al Match correspondiente.
-- ============================================================

drop policy if exists
"Usuarios pueden enviar mensajes en sus matches"
on public.messages;

create policy
"Usuarios pueden enviar mensajes en sus matches"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()

  and

  exists (
    select 1
    from public.matches
    where
      matches.id = messages.match_id
      and (
        matches.user_a = auth.uid()
        or
        matches.user_b = auth.uid()
      )
  )
);