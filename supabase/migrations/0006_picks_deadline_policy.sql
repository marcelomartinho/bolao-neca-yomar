-- 0006_picks_deadline_policy.sql
-- Substitui a regra de bloqueio por starts_at (per-match) por deadline
-- global vindo de app_config. SELECT segue mantendo anti-cola por jogo:
-- só ve picks alheios após apito do match correspondente OU dono sempre.

-- Drop old INSERT/UPDATE/SELECT policies (nomes vieram do agente DBA)
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'picks'
  loop
    execute format('drop policy if exists %I on public.picks', pol.policyname);
  end loop;
end $$;

-- Re-enable RLS (idempotente)
alter table public.picks enable row level security;

-- INSERT: dono + deadline aberto (NULL deadline = aberto)
create policy "picks: insert antes do deadline" on public.picks
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.app_config
      where id = 1 and (picks_deadline is null or picks_deadline > now())
    )
  );

-- UPDATE: dono + deadline aberto
create policy "picks: update antes do deadline" on public.picks
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.app_config
      where id = 1 and (picks_deadline is null or picks_deadline > now())
    )
  );

-- SELECT: dono sempre; outros só após apito do match (anti-cola por jogo).
-- Pós-deadline geral, picks de outros viram visíveis também (jogos antigos já apitaram).
create policy "picks: leitura dono ou apos apito" on public.picks
  for select to anon, authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.matches m
      where m.id = picks.match_id and m.starts_at <= now()
    )
  );
