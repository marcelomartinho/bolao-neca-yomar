-- 0011_activity_log.sql
-- Tabela única de log de atividade. Cada server action grava um registro.
-- Host vê tudo via /admin/atividade. Outros usuários não veem.

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  acting_auth_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_created_at on public.activity_log (created_at desc);
create index if not exists idx_activity_log_user_id on public.activity_log (user_id);
create index if not exists idx_activity_log_action on public.activity_log (action);

alter table public.activity_log enable row level security;

drop policy if exists "activity_log: host le tudo" on public.activity_log;
create policy "activity_log: host le tudo" on public.activity_log
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and host = true
    )
  );

drop policy if exists "activity_log: dono insere proprio" on public.activity_log;
create policy "activity_log: dono insere proprio" on public.activity_log
  for insert to authenticated
  with check (
    acting_auth_user_id = (select auth.uid())
  );
