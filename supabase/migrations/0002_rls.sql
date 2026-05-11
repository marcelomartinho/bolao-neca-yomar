-- =============================================================
-- 0002_rls.sql — Row Level Security — Bolão Neca & Yomar Copa 2026
-- Princípios:
--   1. auth.uid() sempre envolto em (SELECT auth.uid()) para evitar
--      re-execução por linha (Supabase best practice).
--   2. Joins dentro de policies usam EXISTS para eficiência.
--   3. Comentário acima de cada policy explica a regra de negócio.
-- =============================================================

-- ------------------------------------------------------------
-- TEAMS — leitura pública, sem escrita via RLS
-- (dados inseridos via migration/seed; não há UI de edição de times)
-- ------------------------------------------------------------
alter table teams enable row level security;

-- Qualquer pessoa (inclusive anônimo) pode ver as seleções.
create policy "teams: leitura pública"
  on teams for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------
-- GROUPS — leitura pública, sem escrita via RLS
-- ------------------------------------------------------------
alter table groups enable row level security;

-- Qualquer pessoa pode ver os grupos.
create policy "groups: leitura pública"
  on groups for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------
-- MATCHES — leitura pública; UPDATE só para hosts
-- ------------------------------------------------------------
alter table matches enable row level security;

-- Qualquer pessoa pode ver a tabela de jogos.
create policy "matches: leitura pública"
  on matches for select
  to anon, authenticated
  using (true);

-- Somente usuários com profiles.host = true podem marcar resultados.
-- A policy usa EXISTS + (SELECT auth.uid()) para evitar full-scan
-- em profiles a cada linha avaliada.
create policy "matches: update apenas host"
  on matches for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id   = (select auth.uid())
        and host = true
    )
  )
  with check (
    exists (
      select 1 from profiles
      where id   = (select auth.uid())
        and host = true
    )
  );

-- ------------------------------------------------------------
-- PROFILES — leitura pública; UPDATE só pelo dono
-- ------------------------------------------------------------
alter table profiles enable row level security;

-- Qualquer pessoa pode ver o perfil (nome, iniciais, emoji).
-- Necessário para o ranking e para a tela de grupos.
create policy "profiles: leitura pública"
  on profiles for select
  to anon, authenticated
  using (true);

-- Cada usuário só pode atualizar o próprio perfil.
create policy "profiles: update apenas dono"
  on profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Impede que um usuário autenticado insira perfis alheios
-- (o auto-create via trigger usa security definer, não passa por RLS).
create policy "profiles: insert apenas próprio"
  on profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

-- ------------------------------------------------------------
-- PICKS — regras de negócio principais
-- ------------------------------------------------------------
alter table picks enable row level security;

-- REGRA 1: INSERT/UPDATE — dono do pick E jogo ainda não começou.
-- "Cartela aberta" = starts_at > now().
-- A sub-select em starts_at é avaliada uma vez por statement (não por linha)
-- porque é correlacionada apenas via match_id que é constante na expressão.
create policy "picks: insert apenas dono com jogo aberto"
  on picks for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from matches
      where id        = picks.match_id
        and starts_at > now()
    )
  );

create policy "picks: update apenas dono com jogo aberto"
  on picks for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from matches
      where id        = picks.match_id
        and starts_at > now()
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from matches
      where id        = picks.match_id
        and starts_at > now()
    )
  );

-- REGRA 2 — SELECT: ANTI-COLA
--   Caso A: usuário vê sempre seus próprios palpites (qualquer horário).
--   Caso B: palpites ALHEIOS só aparecem após o apito do jogo
--           (starts_at < now()). Antes do apito, o palpite do outro
--           participante é invisível — cola impossível.
--
-- As duas condições são unidas por OR para que a policy
-- retorne linhas que satisfaçam A OU B.
create policy "picks: select dono ou após apito (anti-cola)"
  on picks for select
  to authenticated
  using (
    -- Caso A: é o próprio palpite
    user_id = (select auth.uid())
    or
    -- Caso B: palpite alheio, mas o jogo já começou
    exists (
      select 1 from matches
      where id        = picks.match_id
        and starts_at < now()
    )
  );

-- Anônimos não veem picks (sem autenticação não há cartela).
-- Não criamos policy SELECT para anon → bloco total por RLS.

-- REGRA 3: DELETE — não permitido via RLS.
-- Palpites são imutáveis após o apito (regra do bolão).
-- Sem policy DELETE = ninguém deleta (nem authenticated).
