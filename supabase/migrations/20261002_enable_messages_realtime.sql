-- ============================================================
-- FITMATCH
-- Habilitar Realtime para mensajes
-- Fecha: 2026-10-02
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime
    add table public.messages;
  end if;
end
$$;