-- 0009_match_scores.sql
-- Adiciona placar (90 min) ao jogo. `result` continua sendo a verdade
-- pra cálculo de pontos (1/X/2), mas agora pode ser derivado dos scores.

alter table public.matches
  add column if not exists score_a smallint check (score_a is null or score_a >= 0),
  add column if not exists score_b smallint check (score_b is null or score_b >= 0);

-- Constraint: se um score for definido, ambos devem ser
alter table public.matches drop constraint if exists matches_scores_both_or_none;
alter table public.matches add constraint matches_scores_both_or_none
  check ((score_a is null and score_b is null) or (score_a is not null and score_b is not null));
