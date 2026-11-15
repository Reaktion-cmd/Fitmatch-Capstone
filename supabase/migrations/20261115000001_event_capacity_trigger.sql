-- ============================================================
-- FITMATCH
-- Migración: garantía atómica de cupos en eventos
-- Fecha: 2026-11-15
-- ============================================================
--
-- Problema que resuelve:
--
-- El control de cupos se realizaba únicamente en el cliente
-- (contador visible en pantalla). Dos usuarios que intentaran
-- inscribirse al mismo tiempo, con un único cupo disponible,
-- podían superar el límite: la base de datos solo impedía
-- duplicar la participación del MISMO usuario (clave primaria
-- compuesta event_id + user_id), no el sobrepaso de cupos
-- entre usuarios distintos.
--
-- Solución:
--
-- Trigger BEFORE INSERT sobre event_participants que:
--
--   1. Bloquea la fila del evento (FOR UPDATE) para
--      serializar las inscripciones simultáneas: la segunda
--      inscripción espera a la primera y ve su conteo.
--
--   2. Cuenta los participantes actuales dentro de la misma
--      transacción.
--
--   3. Rechaza la inscripción con el error EVENTO_LLENO si
--      el evento ya alcanzó su cupo (slots).
--
-- La garantía opera a nivel del motor: ninguna ruta de
-- escritura (aplicación, SQL Editor o llamada REST directa)
-- puede superar los cupos definidos por el organizador.
-- ============================================================


-- ============================================================
-- 1. FUNCIÓN DE CONTROL DE CAPACIDAD
-- ============================================================

create or replace function public.controlar_capacidad_evento()
returns trigger
language plpgsql
as $$
declare
  v_slots integer;
begin

  -- Bloquea la fila del evento: dos inscripciones
  -- simultáneas se ejecutan en serie y cada una
  -- evalúa el conteo real al momento de insertar.

  select
    slots
  into
    v_slots
  from public.events
  where id = new.event_id
  for update;

  if v_slots is null then
    raise exception
      'EVENTO_INEXISTENTE: el evento indicado no existe'
      using errcode = 'P0001';
  end if;

  if
    (
      select count(*)
      from public.event_participants
      where event_id = new.event_id
    ) >= v_slots
  then
    raise exception
      'EVENTO_LLENO: el evento ya alcanzó su cupo máximo de % participantes',
      v_slots
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;


-- ============================================================
-- 2. TRIGGER
-- ============================================================

drop trigger if exists
  trg_event_participants_capacidad
  on public.event_participants;

create trigger trg_event_participants_capacidad
  before insert
  on public.event_participants
  for each row
  execute function public.controlar_capacidad_evento();
