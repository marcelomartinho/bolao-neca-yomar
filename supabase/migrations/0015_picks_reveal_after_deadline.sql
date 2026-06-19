-- 0015_picks_reveal_after_deadline.sql
-- Libera a leitura de TODOS os palpites para todos (anon + authenticated)
-- assim que o deadline global de palpites (app_config.picks_deadline) passa.
-- A copa começou e ninguém pode mais alterar palpites, então o anti-cola
-- (que escondia palpites alheios de jogos ainda não apitados) deixa de fazer
-- sentido. Mudança é ADITIVA: mantém os caminhos existentes (dono, host,
-- jogo já apitado) e só acrescenta o branch de "deadline passou".

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
    or exists (
      select 1 from public.app_config c
      where c.id = 1 and c.picks_deadline is not null and c.picks_deadline <= now()
    )
  );
