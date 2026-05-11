-- =============================================================
-- 0001_schema.sql — Bolão Neca & Yomar Copa 2026
-- Destino: Supabase free tier (Postgres 15)
-- Aplicar via: Supabase SQL Editor ou supabase db push
-- =============================================================

-- ------------------------------------------------------------
-- Extensões
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TEAMS — 48 seleções
-- code  : código FIFA (3 letras, PK natural — baixa cardinalidade,
--          imutável, legível em URLs e logs, sem custo de join extra)
-- colors: array fixo de 3 hex strings para renderizar bandeira CSS
-- ------------------------------------------------------------
create table if not exists teams (
  code   text primary key,
  name   text not null,
  colors text[] not null,
  check (cardinality(colors) = 3)
);

-- ------------------------------------------------------------
-- GROUPS — 12 grupos A..L
-- teams: array de 4 códigos FIFA (ordem = posição no grupo)
-- ------------------------------------------------------------
create table if not exists groups (
  letter text primary key check (letter ~ '^[A-L]$'),
  teams  text[] not null,
  check (cardinality(teams) = 4)
);

-- ------------------------------------------------------------
-- MATCHES — 72 jogos da fase de grupos
-- starts_at : timestamptz (UTC armazenado, exibido em BRT no front)
-- result    : null até apitar; '1'=time_a vence, 'X'=empate, '2'=time_b
-- ------------------------------------------------------------
create table if not exists matches (
  id           integer primary key,          -- 1..72
  group_letter text    not null references groups(letter),
  round        integer not null check (round between 1 and 3),
  team_a       text    not null references teams(code),
  team_b       text    not null references teams(code),
  starts_at    timestamptz not null,
  city         text,
  result       char(1) check (result in ('1','X','2')),
  check (team_a <> team_b)
);

-- Índice para queries "jogos de hoje / desta rodada"
create index if not exists idx_matches_starts_at on matches(starts_at);

-- Índice para filtro por grupo (tela de grupos)
create index if not exists idx_matches_group on matches(group_letter);

-- ------------------------------------------------------------
-- PROFILES — um registro por auth.users (magic-link)
-- id   : mesmo UUID do auth.users (FK garante integridade)
-- host : true para Neca e Yomar — podem marcar resultados
-- ------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  initials   text,
  emoji      text,
  host       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PICKS — palpites (1 por usuário por jogo)
-- PK composta: (user_id, match_id) — natural e sem coluna extra
-- updated_at atualizado via trigger abaixo
-- ------------------------------------------------------------
create table if not exists picks (
  user_id    uuid    not null references profiles(id) on delete cascade,
  match_id   integer not null references matches(id)  on delete cascade,
  pick       char(1) not null check (pick in ('1','X','2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

-- Índices para as queries mais frequentes:
--   "todos os palpites do usuário X" (cartela pessoal)
create index if not exists idx_picks_user_id  on picks(user_id);
--   "todos os palpites do jogo Y" (ranking pós-apito)
create index if not exists idx_picks_match_id on picks(match_id);

-- Índice parcial cobrindo o caso anti-cola:
--   "palpites de jogos cujo starts_at < now()" — usado na policy RLS
--   Não cobre starts_at (coluna de matches), mas cobre o join rápido.

-- ------------------------------------------------------------
-- VIEW: ranking
-- Escolha: VIEW regular (não materializada).
-- Justificativa: com 10-30 participantes e 72 jogos o resultado
-- é calculado em microssegundos. MATERIALIZED VIEW exigiria
-- REFRESH manual/pg_cron (indisponível no free tier sem extensão).
-- Se a carga crescer, basta trocar para MATERIALIZED VIEW + índice.
-- ------------------------------------------------------------
create or replace view ranking as
  select
    p.id,
    p.name,
    p.initials,
    p.emoji,
    p.host,
    count(*) filter (where pk.pick = m.result)          as score,
    count(*) filter (where m.result is not null)        as resolved,
    count(pk.match_id)                                   as total_picks
  from profiles p
  left join picks   pk on pk.user_id  = p.id
  left join matches m  on m.id        = pk.match_id
  group by p.id, p.name, p.initials, p.emoji, p.host
  order by score desc nulls last;

-- ------------------------------------------------------------
-- TRIGGER: updated_at em picks
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger picks_updated_at
  before update on picks
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- TRIGGER: auto-criar profile quando auth.users insere
-- O usuário recebe name = email (parte antes de @) e host = false.
-- O perfil pode ser editado depois via UPDATE profiles.
-- ------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, name, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------
-- Revogar acesso público ao schema public (boa prática Supabase)
-- (Supabase já faz isso em projetos novos; incluído por segurança)
-- ------------------------------------------------------------
revoke all on schema public from public;
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on picks, profiles to authenticated;
alter default privileges in schema public
  grant select on tables to anon, authenticated;
