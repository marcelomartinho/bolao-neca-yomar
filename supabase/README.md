# Supabase — Bolão Neca & Yomar Copa 2026

## Como aplicar as migrations

### Opção A — Supabase SQL Editor (recomendado para free tier)

1. Acesse https://supabase.com/dashboard → seu projeto → **SQL Editor**.
2. Cole e execute na ordem:
   - `migrations/0001_schema.sql`
   - `migrations/0002_rls.sql`
   - `migrations/0003_seed.sql`
3. Verifique no **Table Editor** que as tabelas `teams` (48 rows), `groups` (12 rows) e `matches` (72 rows) foram criadas.

### Opção B — Supabase CLI

```bash
# Instalar CLI (uma vez)
npm install -g supabase

# Login
supabase login

# Linkar ao projeto remoto
supabase link --project-ref <seu-project-ref>

# Aplicar migrations
supabase db push
```

As migrations em `supabase/migrations/` são aplicadas em ordem lexicográfica (0001 → 0002 → 0003).

---

## Como testar as RLS policies

Use dois usuários distintos para os testes. Crie via Supabase Dashboard > Authentication > Users:
- **user_a@test.com** — participante comum
- **user_b@test.com** — outro participante
- Marque um deles com `host = true` via `UPDATE profiles SET host = true WHERE id = '<uuid>'`.

### Cenário 1 — Ver palpite alheio ANTES do jogo (deve falhar)

```sql
-- Logado como user_a, inserir palpite no jogo 72 (2026-06-28 22h BRT — futuro)
insert into picks (user_id, match_id, pick)
values (auth.uid(), 72, '1');

-- Logado como user_b, tentar ver o palpite de user_a no jogo 72
select * from picks
where match_id = 72
  and user_id  = '<uuid_user_a>';
-- ESPERADO: 0 rows (jogo ainda não começou → anti-cola bloqueia)
```

### Cenário 2 — Ver palpite alheio APÓS o jogo (deve funcionar)

```sql
-- Como host, simular que o jogo 1 (2026-06-11 13h) já ocorreu
-- (em produção o host marca o resultado via UI; aqui forçamos starts_at no passado)
update matches set starts_at = now() - interval '1 hour' where id = 1;

-- user_a insere palpite (precisa de jogo aberto — use outro match futuro para isso;
-- este teste verifica só o SELECT pós-apito)
-- Logado como user_b, ver palpite de user_a no jogo 1
select * from picks
where match_id = 1
  and user_id  = '<uuid_user_a>';
-- ESPERADO: 1 row (jogo já começou → visível para todos)
```

### Cenário 3 — UPDATE de match por não-host (deve falhar)

```sql
-- Logado como user_b (host = false), tentar marcar resultado
update matches set result = '1' where id = 5;
-- ESPERADO: 0 rows affected / "new row violates row-level security policy"
-- (apenas profiles.host = true podem fazer UPDATE em matches)
```

---

## Notas de design

| Decisao | Justificativa |
|---|---|
| VIEW regular (nao materializada) para ranking | Free tier nao tem pg_cron; 10-30 usuarios e 72 jogos calculam em microsegundos sem REFRESH |
| PK natural `text` em teams/groups | Codigo FIFA e imutavel, legivel em URLs, sem custo de join extra |
| `(SELECT auth.uid())` nas policies | Evita re-execucao da funcao por linha (Supabase best practice) |
| Sem policy DELETE em picks | Palpites sao imutaveis apos o apito — regra do bolao |
| starts_at com offset -03:00 | Armazenado em UTC pelo Postgres; exibido em BRT no front via `toLocaleString` |
