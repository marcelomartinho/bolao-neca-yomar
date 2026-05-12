-- 0010_picks_delete_policy.sql
-- Permite DELETE em picks pra hosts (operações de zona perigosa em /admin).
-- Antes, RLS bloqueava todos os DELETE porque não havia policy DELETE,
-- então clearPicksOfUser e clearAllPicks retornavam 0 rows mesmo com
-- guard host no app.

drop policy if exists "picks: delete por host" on public.picks;
create policy "picks: delete por host" on public.picks
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and host = true
    )
  );
