-- ============================================================
-- FITMATCH
-- Migración: calificaciones de deportistas (estrellas + comentario)
-- Fecha: 2026-11-04
-- ============================================================
--
-- Tabla public.profile_ratings:
--
-- rater_id  -> quién califica (siempre auth.uid())
-- rated_id  -> quién es calificado (el deportista evaluado)
-- event_id  -> evento por el que se califica (opcional:
--              asistió y De qué manera jugó). NULL = calificación
--              general sin evento.
-- stars     -> 1 a 5 estrellas (obligatorio)
-- comment   -> comentario de texto (opcional, 0-500 caracteres)
--
-- Un usuario solo puede calificar una vez a otra persona por
-- evento, y una vez en general (sin evento).
--
-- Esto responde: "¿la persona asiste a los eventos y qué tal juega?"
-- ============================================================


-- ============================================================
-- 1. CREAR LA TABLA
-- ============================================================

create table if not exists public.profile_ratings (
  id          uuid primary key default gen_random_uuid(),
  rater_id    uuid not null references auth.users(id) on delete cascade,
  rated_id    uuid not null references auth.users(id) on delete cascade,
  event_id    uuid references public.events(id) on delete set null,
  stars       integer not null check (stars between 1 and 5),
  comment     text check (comment is null or length(comment) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (rater_id <> rated_id)
);


-- ============================================================
-- 2. ÍNDICES
-- ============================================================

create index if not exists profile_ratings_rated_idx
  on public.profile_ratings (rated_id);

create index if not exists profile_ratings_rater_idx
  on public.profile_ratings (rater_id);

create index if not exists profile_ratings_event_idx
  on public.profile_ratings (event_id)
  where event_id is not null;


-- ============================================================
-- 3. REGLA DE UNICIDAD
--    (una calificación por persona en general, y otra por evento)
-- ============================================================

create unique index if not exists profile_ratings_general_unique
  on public.profile_ratings (rater_id, rated_id)
  where event_id is null;

create unique index if not exists profile_ratings_event_unique
  on public.profile_ratings (rater_id, rated_id, event_id)
  where event_id is not null;


-- ============================================================
-- 4. SEGURIDAD A NIVEL DE FILA (RLS)
-- ============================================================

alter table public.profile_ratings enable row level security;


-- Todos los autenticados pueden LEER las calificaciones
-- (necesario para mostrar el promedio en los perfiles).

drop policy if exists "ratings_select_authenticated" on public.profile_ratings;

create policy "ratings_select_authenticated"
on public.profile_ratings
for select
to authenticated
using (true);


-- Solo el autor puede CREAR su calificación.

drop policy if exists "ratings_insert_rater" on public.profile_ratings;

create policy "ratings_insert_rater"
on public.profile_ratings
for insert
to authenticated
with check (
  rater_id = auth.uid()
);


-- Solo el autor puede EDITAR su calificación.

drop policy if exists "ratings_update_rater" on public.profile_ratings;

create policy "ratings_update_rater"
on public.profile_ratings
for update
to authenticated
using (
  rater_id = auth.uid()
)
with check (
  rater_id = auth.uid()
);


-- Solo el autor puede BORRAR su calificación.

drop policy if exists "ratings_delete_rater" on public.profile_ratings;

create policy "ratings_delete_rater"
on public.profile_ratings
for delete
to authenticated
using (
  rater_id = auth.uid()
);
