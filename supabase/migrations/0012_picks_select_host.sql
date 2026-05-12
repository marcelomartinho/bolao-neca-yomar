-- 0012_picks_select_host.sql
-- Adiciona caminho de leitura pra hosts: admins (Marcelo, Yomar, Bruno) veem
-- TODOS os palpites de qualquer participante, mesmo antes do apito do jogo.
-- Não-host segue regra anti-cola: só vê próprios palpites OU palpites
-- de outros após o match starts_at < now().

drop policy if exists "picks: leitura dono apos apito" on public.picks;
create policy "picks: leitura dono apos apito" on public.picks
  for select to anon, authenticated
  using (
    public.is_profile_managed_by_uid(user_id)
    or exists (
      select 1 from public.matches m
      where m.id = picks.match_id and m.starts_at <= now()
    )
    or exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and host = true
    )
  );
