-- =============================================================
-- 0003_seed.sql — Seed: teams, groups, matches
-- Fonte canônica: _design/bol-o-neca-yomar/project/data.js
-- Cores: paleta C{} do data.js (3 hex strings por time)
-- Grupos: data.js com fixes de duplicatas (H, K, L)
-- Jogos: 72 partidas, algoritmo data.js
--        4 jogos/dia · horários 13/16/19/22 BRT (UTC-3)
--        Datas: 2026-06-11 → 2026-06-28
--        starts_at armazenado em UTC (BRT + 3h)
-- =============================================================

-- ------------------------------------------------------------
-- TEAMS (48 seleções)
-- ------------------------------------------------------------
insert into teams (code, name, colors) values
  ('MEX', 'México',          array['#006847','#ffffff','#ce1126']),
  ('COL', 'Colômbia',        array['#fcd116','#003893','#ce1126']),
  ('NOR', 'Noruega',         array['#ef2b2d','#ffffff','#002868']),
  ('UZB', 'Uzbequistão',     array['#1eb53a','#ffffff','#0099b5']),
  ('CAN', 'Canadá',          array['#d52b1e','#ffffff','#d52b1e']),
  ('BEL', 'Bélgica',         array['#000000','#fae042','#ed2939']),
  ('TUN', 'Tunísia',         array['#e70013','#ffffff','#e70013']),
  ('NZL', 'Nova Zelândia',   array['#012169','#ffffff','#cc142b']),
  ('USA', 'Estados Unidos',  array['#b22234','#ffffff','#3c3b6e']),
  ('CRO', 'Croácia',         array['#171796','#ffffff','#ff0000']),
  ('PAR', 'Paraguai',        array['#d52b1e','#ffffff','#0038a8']),
  ('JOR', 'Jordânia',        array['#000000','#ffffff','#007a3d']),
  ('BRA', 'Brasil',          array['#009b3a','#fedf00','#002776']),
  ('SUI', 'Suíça',           array['#d52b1e','#ffffff','#d52b1e']),
  ('SEN', 'Senegal',         array['#00853f','#fdef42','#e31b23']),
  ('KSA', 'Arábia Saudita',  array['#006c35','#ffffff','#006c35']),
  ('ARG', 'Argentina',       array['#74acdf','#ffffff','#74acdf']),
  ('JPN', 'Japão',           array['#ffffff','#bc002d','#ffffff']),
  ('EGY', 'Egito',           array['#ce1126','#ffffff','#000000']),
  ('CPV', 'Cabo Verde',      array['#003893','#ffffff','#cf2027']),
  ('FRA', 'França',          array['#0055a4','#ffffff','#ef4135']),
  ('DEN', 'Dinamarca',       array['#c8102e','#ffffff','#c8102e']),
  ('NGA', 'Nigéria',         array['#008753','#ffffff','#008753']),
  ('PAN', 'Panamá',          array['#005293','#ffffff','#d21034']),
  ('ESP', 'Espanha',         array['#aa151b','#f1bf00','#aa151b']),
  ('KOR', 'Coreia do Sul',   array['#ffffff','#003478','#ffffff']),
  ('CIV', 'Costa do Marfim', array['#f77f00','#ffffff','#009e60']),
  ('JAM', 'Jamaica',         array['#009b3a','#000000','#ffd100']),
  ('ENG', 'Inglaterra',      array['#ffffff','#ce1124','#ffffff']),
  ('POL', 'Polônia',         array['#ffffff','#dc143c','#dc143c']),
  ('ALG', 'Argélia',         array['#006633','#ffffff','#d21034']),
  ('RSA', 'África do Sul',   array['#007749','#ffb612','#de3831']),
  ('GER', 'Alemanha',        array['#000000','#dd0000','#ffce00']),
  ('ECU', 'Equador',         array['#ffce00','#034ea2','#ed1c24']),
  ('CMR', 'Camarões',        array['#007a5e','#ce1126','#fcd116']),
  ('QAT', 'Catar',           array['#8a1538','#ffffff','#8a1538']),
  ('POR', 'Portugal',        array['#006600','#006600','#ff0000']),
  ('URU', 'Uruguai',         array['#7eb6ea','#ffffff','#7eb6ea']),
  ('IRN', 'Irã',             array['#239f40','#ffffff','#da0000']),
  ('AUS', 'Austrália',       array['#012169','#ffffff','#e4002b']),
  ('ITA', 'Itália',          array['#008c45','#f4f5f0','#cd212a']),
  ('SRB', 'Sérvia',          array['#c6363c','#0c4076','#ffffff']),
  ('MAR', 'Marrocos',        array['#c1272d','#006233','#c1272d']),
  ('TUR', 'Turquia',         array['#e30a17','#ffffff','#e30a17']),
  ('NED', 'Holanda',         array['#ae1c28','#ffffff','#21468b']),
  ('AUT', 'Áustria',         array['#ed2939','#ffffff','#ed2939']),
  ('GHA', 'Gana',            array['#ce1126','#fcd116','#006b3f']),
  ('CRC', 'Costa Rica',      array['#002b7f','#ffffff','#ce1126'])
on conflict (code) do update
  set name   = excluded.name,
      colors = excluded.colors;

-- ------------------------------------------------------------
-- GROUPS (12 grupos A..L)
-- ------------------------------------------------------------
insert into groups (letter, teams) values
  ('A', array['MEX','COL','NOR','UZB']),
  ('B', array['CAN','BEL','TUN','NZL']),
  ('C', array['USA','CRO','PAR','JOR']),
  ('D', array['BRA','SUI','SEN','KSA']),
  ('E', array['ARG','JPN','EGY','CPV']),
  ('F', array['FRA','DEN','NGA','PAN']),
  ('G', array['ESP','KOR','CIV','JAM']),
  ('H', array['ENG','POL','ALG','RSA']),
  ('I', array['GER','ECU','CMR','QAT']),
  ('J', array['POR','URU','IRN','AUS']),
  ('K', array['ITA','SRB','MAR','TUR']),
  ('L', array['NED','AUT','GHA','CRC'])
on conflict (letter) do update
  set teams = excluded.teams;

-- ------------------------------------------------------------
-- MATCHES (72 jogos)
-- starts_at = horário BRT convertido para UTC (BRT = UTC-3, +3h)
-- Formato: 'YYYY-MM-DD HH:MM:SS-03:00' (Postgres interpreta BRT)
-- ------------------------------------------------------------
insert into matches (id, group_letter, round, team_a, team_b, starts_at, city) values
-- Rodada 1 (2026-06-11 → 2026-06-16)
  ( 1,'A',1,'MEX','COL', '2026-06-11 13:00:00-03:00','Cidade do México'),
  ( 2,'A',1,'NOR','UZB', '2026-06-11 16:00:00-03:00','Nova Iorque'),
  ( 3,'B',1,'CAN','BEL', '2026-06-11 19:00:00-03:00','Atlanta'),
  ( 4,'B',1,'TUN','NZL', '2026-06-11 22:00:00-03:00','Filadélfia'),
  ( 5,'C',1,'USA','CRO', '2026-06-12 13:00:00-03:00','Guadalajara'),
  ( 6,'C',1,'PAR','JOR', '2026-06-12 16:00:00-03:00','Boston'),
  ( 7,'D',1,'BRA','SUI', '2026-06-12 19:00:00-03:00','Toronto'),
  ( 8,'D',1,'SEN','KSA', '2026-06-12 22:00:00-03:00','Miami'),
  ( 9,'E',1,'ARG','JPN', '2026-06-13 13:00:00-03:00','Monterrey'),
  (10,'E',1,'EGY','CPV', '2026-06-13 16:00:00-03:00','Houston'),
  (11,'F',1,'FRA','DEN', '2026-06-13 19:00:00-03:00','San Francisco'),
  (12,'F',1,'NGA','PAN', '2026-06-13 22:00:00-03:00','Los Angeles'),
  (13,'G',1,'ESP','KOR', '2026-06-14 13:00:00-03:00','Dallas'),
  (14,'G',1,'CIV','JAM', '2026-06-14 16:00:00-03:00','Vancouver'),
  (15,'H',1,'ENG','POL', '2026-06-14 19:00:00-03:00','Seattle'),
  (16,'H',1,'ALG','RSA', '2026-06-14 22:00:00-03:00','Kansas City'),
  (17,'I',1,'GER','ECU', '2026-06-15 13:00:00-03:00','Cidade do México'),
  (18,'I',1,'CMR','QAT', '2026-06-15 16:00:00-03:00','Nova Iorque'),
  (19,'J',1,'POR','URU', '2026-06-15 19:00:00-03:00','Atlanta'),
  (20,'J',1,'IRN','AUS', '2026-06-15 22:00:00-03:00','Filadélfia'),
  (21,'K',1,'ITA','SRB', '2026-06-16 13:00:00-03:00','Guadalajara'),
  (22,'K',1,'MAR','TUR', '2026-06-16 16:00:00-03:00','Boston'),
  (23,'L',1,'NED','AUT', '2026-06-16 19:00:00-03:00','Toronto'),
  (24,'L',1,'GHA','CRC', '2026-06-16 22:00:00-03:00','Miami'),
-- Rodada 2 (2026-06-17 → 2026-06-22)
  (25,'A',2,'MEX','NOR', '2026-06-17 13:00:00-03:00','Monterrey'),
  (26,'A',2,'COL','UZB', '2026-06-17 16:00:00-03:00','Houston'),
  (27,'B',2,'CAN','TUN', '2026-06-17 19:00:00-03:00','San Francisco'),
  (28,'B',2,'BEL','NZL', '2026-06-17 22:00:00-03:00','Los Angeles'),
  (29,'C',2,'USA','PAR', '2026-06-18 13:00:00-03:00','Dallas'),
  (30,'C',2,'CRO','JOR', '2026-06-18 16:00:00-03:00','Vancouver'),
  (31,'D',2,'BRA','SEN', '2026-06-18 19:00:00-03:00','Seattle'),
  (32,'D',2,'SUI','KSA', '2026-06-18 22:00:00-03:00','Kansas City'),
  (33,'E',2,'ARG','EGY', '2026-06-19 13:00:00-03:00','Cidade do México'),
  (34,'E',2,'JPN','CPV', '2026-06-19 16:00:00-03:00','Nova Iorque'),
  (35,'F',2,'FRA','NGA', '2026-06-19 19:00:00-03:00','Atlanta'),
  (36,'F',2,'DEN','PAN', '2026-06-19 22:00:00-03:00','Filadélfia'),
  (37,'G',2,'ESP','CIV', '2026-06-20 13:00:00-03:00','Guadalajara'),
  (38,'G',2,'KOR','JAM', '2026-06-20 16:00:00-03:00','Boston'),
  (39,'H',2,'ENG','ALG', '2026-06-20 19:00:00-03:00','Toronto'),
  (40,'H',2,'POL','RSA', '2026-06-20 22:00:00-03:00','Miami'),
  (41,'I',2,'GER','CMR', '2026-06-21 13:00:00-03:00','Monterrey'),
  (42,'I',2,'ECU','QAT', '2026-06-21 16:00:00-03:00','Houston'),
  (43,'J',2,'POR','IRN', '2026-06-21 19:00:00-03:00','San Francisco'),
  (44,'J',2,'URU','AUS', '2026-06-21 22:00:00-03:00','Los Angeles'),
  (45,'K',2,'ITA','MAR', '2026-06-22 13:00:00-03:00','Dallas'),
  (46,'K',2,'SRB','TUR', '2026-06-22 16:00:00-03:00','Vancouver'),
  (47,'L',2,'NED','GHA', '2026-06-22 19:00:00-03:00','Seattle'),
  (48,'L',2,'AUT','CRC', '2026-06-22 22:00:00-03:00','Kansas City'),
-- Rodada 3 (2026-06-23 → 2026-06-28) — última rodada simultânea por grupo
  (49,'A',3,'MEX','UZB', '2026-06-23 13:00:00-03:00','Cidade do México'),
  (50,'A',3,'COL','NOR', '2026-06-23 16:00:00-03:00','Nova Iorque'),
  (51,'B',3,'CAN','NZL', '2026-06-23 19:00:00-03:00','Atlanta'),
  (52,'B',3,'BEL','TUN', '2026-06-23 22:00:00-03:00','Filadélfia'),
  (53,'C',3,'USA','JOR', '2026-06-24 13:00:00-03:00','Guadalajara'),
  (54,'C',3,'CRO','PAR', '2026-06-24 16:00:00-03:00','Boston'),
  (55,'D',3,'BRA','KSA', '2026-06-24 19:00:00-03:00','Toronto'),
  (56,'D',3,'SUI','SEN', '2026-06-24 22:00:00-03:00','Miami'),
  (57,'E',3,'ARG','CPV', '2026-06-25 13:00:00-03:00','Monterrey'),
  (58,'E',3,'JPN','EGY', '2026-06-25 16:00:00-03:00','Houston'),
  (59,'F',3,'FRA','PAN', '2026-06-25 19:00:00-03:00','San Francisco'),
  (60,'F',3,'DEN','NGA', '2026-06-25 22:00:00-03:00','Los Angeles'),
  (61,'G',3,'ESP','JAM', '2026-06-26 13:00:00-03:00','Dallas'),
  (62,'G',3,'KOR','CIV', '2026-06-26 16:00:00-03:00','Vancouver'),
  (63,'H',3,'ENG','RSA', '2026-06-26 19:00:00-03:00','Seattle'),
  (64,'H',3,'POL','ALG', '2026-06-26 22:00:00-03:00','Kansas City'),
  (65,'I',3,'GER','QAT', '2026-06-27 13:00:00-03:00','Cidade do México'),
  (66,'I',3,'ECU','CMR', '2026-06-27 16:00:00-03:00','Nova Iorque'),
  (67,'J',3,'POR','AUS', '2026-06-27 19:00:00-03:00','Atlanta'),
  (68,'J',3,'URU','IRN', '2026-06-27 22:00:00-03:00','Filadélfia'),
  (69,'K',3,'ITA','TUR', '2026-06-28 13:00:00-03:00','Guadalajara'),
  (70,'K',3,'SRB','MAR', '2026-06-28 16:00:00-03:00','Boston'),
  (71,'L',3,'NED','CRC', '2026-06-28 19:00:00-03:00','Toronto'),
  (72,'L',3,'AUT','GHA', '2026-06-28 22:00:00-03:00','Miami')
on conflict (id) do update
  set group_letter = excluded.group_letter,
      round        = excluded.round,
      team_a       = excluded.team_a,
      team_b       = excluded.team_b,
      starts_at    = excluded.starts_at,
      city         = excluded.city;
