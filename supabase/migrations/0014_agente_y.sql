-- =============================================================
-- 0014_agente_y.sql — Jogador-benchmark de IA "Agente Y"
-- -------------------------------------------------------------
-- Roda como postgres (migration) → ignora RLS, por isso consegue
-- inserir um perfil SEM auth (auth_user_id e parent_id nulos) e
-- seus palpites. Aplicar via scripts/seed-agente-y.mjs (service-role,
-- idempotente) ou no SQL Editor.
--
-- Palpites: 1 = vence mandante · X = empate · 2 = vence visitante.
-- Base da decisão (jun/2026): ranking FIFA atual + tradição em Copas
-- + craques de referência + fator casa (MEX/USA/CAN). Confrontos
-- são os OFICIAIS da Copa 2026 (mesmos da prod, migration 0013).
-- Fontes: football-ranking.com, ESPN, FIFA (ranking de 09-10/jun/2026).
-- =============================================================

insert into public.profiles (id, name, initials, emoji, host, auth_user_id, parent_id)
values ('00000000-0000-4000-8000-0000000000a7', 'Agente Y', 'AY', '🤖', false, null, null)
on conflict (id) do update
  set name     = excluded.name,
      initials = excluded.initials,
      emoji    = excluded.emoji;

insert into public.picks (user_id, match_id, pick) values
-- Rodada 1
  ('00000000-0000-4000-8000-0000000000a7',  1, '1'),  -- MEX x RSA  (México #14, casa)
  ('00000000-0000-4000-8000-0000000000a7',  2, '1'),  -- KOR x CZE  (Coreia #25 > Tchéquia #39)
  ('00000000-0000-4000-8000-0000000000a7',  3, '1'),  -- CAN x BIH  (Canadá casa #30 > Bósnia)
  ('00000000-0000-4000-8000-0000000000a7',  4, '1'),  -- USA x PAR  (EUA #17, casa)
  ('00000000-0000-4000-8000-0000000000a7',  5, '2'),  -- QAT x SUI  (Suíça #19 >> Catar)
  ('00000000-0000-4000-8000-0000000000a7',  6, '1'),  -- BRA x MAR  (Brasil em alta: 6-2 Panamá + 2-1 Egito; Marrocos só 1-1 Noruega)
  ('00000000-0000-4000-8000-0000000000a7',  7, '2'),  -- HAI x SCO  (Escócia #42 >> Haiti)
  ('00000000-0000-4000-8000-0000000000a7',  8, '2'),  -- AUS x TUR  (Turquia #22 > Austrália #27)
  ('00000000-0000-4000-8000-0000000000a7',  9, '1'),  -- GER x CUR  (Alemanha #10 >> Curaçao)
  ('00000000-0000-4000-8000-0000000000a7', 10, '1'),  -- NED x JPN  (Holanda #8 > Japão #18)
  ('00000000-0000-4000-8000-0000000000a7', 11, '2'),  -- CIV x ECU  (Equador #23 > Costa do Marfim #33)
  ('00000000-0000-4000-8000-0000000000a7', 12, '1'),  -- SWE x TUN  (Suécia: Isak/Gyökeres)
  ('00000000-0000-4000-8000-0000000000a7', 13, '1'),  -- ESP x CPV  (Espanha #2 >> Cabo Verde)
  ('00000000-0000-4000-8000-0000000000a7', 14, '1'),  -- BEL x EGY  (Bélgica #9 > Egito #29)
  ('00000000-0000-4000-8000-0000000000a7', 15, '2'),  -- KSA x URU  (Uruguai #16 >> Arábia)
  ('00000000-0000-4000-8000-0000000000a7', 16, '1'),  -- IRN x NZL  (Irã #21 >> Nova Zelândia)
  ('00000000-0000-4000-8000-0000000000a7', 17, '1'),  -- FRA x SEN  (França #3, Mbappé)
  ('00000000-0000-4000-8000-0000000000a7', 18, '2'),  -- IRQ x NOR  (Noruega: Haaland/Ødegaard)
  ('00000000-0000-4000-8000-0000000000a7', 19, '1'),  -- ARG x ALG  (Argentina #1, campeã)
  ('00000000-0000-4000-8000-0000000000a7', 20, '1'),  -- AUT x JOR  (Áustria #24 > Jordânia)
  ('00000000-0000-4000-8000-0000000000a7', 21, '1'),  -- POR x COD  (Portugal #5, Ronaldo)
  ('00000000-0000-4000-8000-0000000000a7', 22, '1'),  -- ENG x CRO  (Inglaterra #4 > Croácia #11)
  ('00000000-0000-4000-8000-0000000000a7', 23, '2'),  -- GHA x PAN  (Panamá #34 > Gana)
  ('00000000-0000-4000-8000-0000000000a7', 24, '2'),  -- UZB x COL  (Colômbia #13 >> Uzbequistão)
-- Rodada 2
  ('00000000-0000-4000-8000-0000000000a7', 25, '1'),  -- CZE x RSA  (Tchéquia > África do Sul)
  ('00000000-0000-4000-8000-0000000000a7', 26, '1'),  -- SUI x BIH  (Suíça #19 >> Bósnia)
  ('00000000-0000-4000-8000-0000000000a7', 27, '1'),  -- CAN x QAT  (Canadá casa > Catar)
  ('00000000-0000-4000-8000-0000000000a7', 28, '1'),  -- MEX x KOR  (México #14, casa > Coreia #25)
  ('00000000-0000-4000-8000-0000000000a7', 29, '1'),  -- USA x AUS  (EUA #17, casa > Austrália)
  ('00000000-0000-4000-8000-0000000000a7', 30, '2'),  -- SCO x MAR  (Marrocos #7 >> Escócia)
  ('00000000-0000-4000-8000-0000000000a7', 31, '1'),  -- BRA x HAI  (Brasil #6 >> Haiti)
  ('00000000-0000-4000-8000-0000000000a7', 32, '1'),  -- TUR x PAR  (Turquia #22 > Paraguai #40)
  ('00000000-0000-4000-8000-0000000000a7', 33, '1'),  -- NED x SWE  (Holanda #8 >> Suécia)
  ('00000000-0000-4000-8000-0000000000a7', 34, '1'),  -- GER x CIV  (Alemanha #10 >> Costa do Marfim)
  ('00000000-0000-4000-8000-0000000000a7', 35, '1'),  -- ECU x CUR  (Equador #23 >> Curaçao)
  ('00000000-0000-4000-8000-0000000000a7', 36, '2'),  -- TUN x JPN  (Japão #18 >> Tunísia)
  ('00000000-0000-4000-8000-0000000000a7', 37, '1'),  -- ESP x KSA  (Espanha #2 >> Arábia)
  ('00000000-0000-4000-8000-0000000000a7', 38, '1'),  -- BEL x IRN  (Bélgica #9 > Irã #21)
  ('00000000-0000-4000-8000-0000000000a7', 39, '1'),  -- URU x CPV  (Uruguai #16 >> Cabo Verde)
  ('00000000-0000-4000-8000-0000000000a7', 40, '2'),  -- NZL x EGY  (Egito #29: Salah >> N.Zelândia)
  ('00000000-0000-4000-8000-0000000000a7', 41, '1'),  -- ARG x AUT  (Argentina #1 >> Áustria)
  ('00000000-0000-4000-8000-0000000000a7', 42, '1'),  -- FRA x IRQ  (França #3 >> Iraque)
  ('00000000-0000-4000-8000-0000000000a7', 43, 'X'),  -- NOR x SEN  (Noruega x Senegal — parelho)
  ('00000000-0000-4000-8000-0000000000a7', 44, '2'),  -- JOR x ALG  (Argélia #28 > Jordânia)
  ('00000000-0000-4000-8000-0000000000a7', 45, '1'),  -- POR x UZB  (Portugal #5 >> Uzbequistão)
  ('00000000-0000-4000-8000-0000000000a7', 46, '1'),  -- ENG x GHA  (Inglaterra #4 >> Gana)
  ('00000000-0000-4000-8000-0000000000a7', 47, '2'),  -- PAN x CRO  (Croácia #11 >> Panamá)
  ('00000000-0000-4000-8000-0000000000a7', 48, '1'),  -- COL x COD  (Colômbia #13 >> RD Congo)
-- Rodada 3
  ('00000000-0000-4000-8000-0000000000a7', 49, 'X'),  -- SUI x CAN  (Canadá joga em casa — parelho)
  ('00000000-0000-4000-8000-0000000000a7', 50, '2'),  -- BIH x QAT  (Catar > Bósnia)
  ('00000000-0000-4000-8000-0000000000a7', 51, '2'),  -- SCO x BRA  (Brasil #6 >> Escócia)
  ('00000000-0000-4000-8000-0000000000a7', 52, '1'),  -- MAR x HAI  (Marrocos #7 >> Haiti)
  ('00000000-0000-4000-8000-0000000000a7', 53, '2'),  -- CZE x MEX  (México #14, casa > Tchéquia)
  ('00000000-0000-4000-8000-0000000000a7', 54, '2'),  -- RSA x KOR  (Coreia #25 > África do Sul)
  ('00000000-0000-4000-8000-0000000000a7', 55, '2'),  -- CUR x CIV  (Costa do Marfim >> Curaçao)
  ('00000000-0000-4000-8000-0000000000a7', 56, '2'),  -- ECU x GER  (Alemanha #10 > Equador #23)
  ('00000000-0000-4000-8000-0000000000a7', 57, '1'),  -- JPN x SWE  (Japão #18 > Suécia)
  ('00000000-0000-4000-8000-0000000000a7', 58, '2'),  -- TUN x NED  (Holanda #8 >> Tunísia)
  ('00000000-0000-4000-8000-0000000000a7', 59, '2'),  -- TUR x USA  (EUA #17, casa > Turquia)
  ('00000000-0000-4000-8000-0000000000a7', 60, '2'),  -- PAR x AUS  (Austrália #27 > Paraguai #40)
  ('00000000-0000-4000-8000-0000000000a7', 61, '2'),  -- NOR x FRA  (França #3 >> Noruega)
  ('00000000-0000-4000-8000-0000000000a7', 62, '1'),  -- SEN x IRQ  (Senegal #15 >> Iraque)
  ('00000000-0000-4000-8000-0000000000a7', 63, '1'),  -- CPV x KSA  (Cabo Verde 3-0 Sérvia; Arábia 1-2 Equador — forma manda)
  ('00000000-0000-4000-8000-0000000000a7', 64, '2'),  -- URU x ESP  (Espanha #2 > Uruguai #16)
  ('00000000-0000-4000-8000-0000000000a7', 65, 'X'),  -- EGY x IRN  (Egito x Irã — parelho)
  ('00000000-0000-4000-8000-0000000000a7', 66, '2'),  -- NZL x BEL  (Bélgica #9 >> Nova Zelândia)
  ('00000000-0000-4000-8000-0000000000a7', 67, '2'),  -- PAN x ENG  (Inglaterra #4 >> Panamá)
  ('00000000-0000-4000-8000-0000000000a7', 68, '1'),  -- CRO x GHA  (Croácia #11 >> Gana)
  ('00000000-0000-4000-8000-0000000000a7', 69, '2'),  -- COL x POR  (Portugal #5 > Colômbia #13)
  ('00000000-0000-4000-8000-0000000000a7', 70, '1'),  -- COD x UZB  (RD Congo #45 > Uzbequistão)
  ('00000000-0000-4000-8000-0000000000a7', 71, '1'),  -- ALG x AUT  (Argélia venceu fora na Holanda 0-1; Áustria só 1-0 Tunísia)
  ('00000000-0000-4000-8000-0000000000a7', 72, '2')   -- JOR x ARG  (Argentina #1 >> Jordânia)
on conflict (user_id, match_id) do update set pick = excluded.pick;
