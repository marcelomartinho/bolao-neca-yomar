-- 0004_perf_indexes.sql
-- Adiciona índices em FK de matches → teams identificados pelo QA-DATABASE.md.
-- Pre-Copa o volume é trivial; estes índices ficam preparados pra queries
-- "todos os jogos da seleção X" no Sprint 4 (perfil de seleção, futuro).

create index if not exists idx_matches_team_a on public.matches (team_a);
create index if not exists idx_matches_team_b on public.matches (team_b);
