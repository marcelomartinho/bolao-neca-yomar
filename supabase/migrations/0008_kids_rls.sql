-- 0008_kids_rls.sql
-- Permite que um adulto autenticado gerencie picks dos próprios perfis filhos.
-- Helper centraliza a regra "este profile.id é gerenciado pelo auth.uid() atual?".

create or replace function public.is_profile_managed_by_uid(profile_id uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and (
        p.auth_user_id = (select auth.uid())
        or p.parent_id in (
          select id from public.profiles where auth_user_id = (select auth.uid())
        )
      )
  );
$$;

revoke all on function public.is_profile_managed_by_uid(uuid) from public;
grant execute on function public.is_profile_managed_by_uid(uuid) to authenticated, anon;

-- Replace policies em picks pra usar o helper
drop policy if exists "picks: insert antes do deadline" on public.picks;
drop policy if exists "picks: update antes do deadline" on public.picks;
drop policy if exists "picks: leitura dono ou apos apito" on public.picks;

create policy "picks: insert antes do deadline" on public.picks
  for insert to authenticated
  with check (
    public.is_profile_managed_by_uid(user_id)
    and exists (
      select 1 from public.app_config
      where id = 1 and (picks_deadline is null or picks_deadline > now())
    )
  );

create policy "picks: update antes do deadline" on public.picks
  for update to authenticated
  using (public.is_profile_managed_by_uid(user_id))
  with check (
    public.is_profile_managed_by_uid(user_id)
    and exists (
      select 1 from public.app_config
      where id = 1 and (picks_deadline is null or picks_deadline > now())
    )
  );

create policy "picks: leitura dono apos apito" on public.picks
  for select to anon, authenticated
  using (
    public.is_profile_managed_by_uid(user_id)
    or exists (
      select 1 from public.matches m
      where m.id = picks.match_id and m.starts_at <= now()
    )
  );

-- Profile RLS: kid pode ser inserido/lido se parent_id é gerenciado pelo auth.uid()
drop policy if exists "profiles: leitura publica" on public.profiles;
create policy "profiles: leitura publica" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "profiles: update proprio" on public.profiles;
create policy "profiles: update proprio ou filho" on public.profiles
  for update to authenticated
  using (public.is_profile_managed_by_uid(id))
  with check (public.is_profile_managed_by_uid(id));

drop policy if exists "profiles: insert filho" on public.profiles;
create policy "profiles: insert filho" on public.profiles
  for insert to authenticated
  with check (
    parent_id is not null
    and auth_user_id is null
    and parent_id in (
      select id from public.profiles where auth_user_id = (select auth.uid())
    )
  );

drop policy if exists "profiles: delete filho" on public.profiles;
create policy "profiles: delete filho" on public.profiles
  for delete to authenticated
  using (
    parent_id is not null
    and parent_id in (
      select id from public.profiles where auth_user_id = (select auth.uid())
    )
  );

-- View ranking: substituir para usar profiles (sem mudanças se já agrega por id)
-- Mantém estrutura atual; helpers consultam profiles diretamente.
