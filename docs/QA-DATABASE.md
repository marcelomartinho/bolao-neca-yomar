# QA-DATABASE — Bolão Neca & Yomar Copa 2026

Revisão executada em: 2026-05-11
Projeto Supabase: `sdqgosoavqqyhzizptrx`
Migrations aplicadas: `0001_schema.sql`, `0002_rls.sql`, `0003_seed.sql`

---

## 1. RLS — Status por tabela

| Tabela    | RLS Ligada |
|-----------|-----------|
| groups    | SIM       |
| matches   | SIM       |
| picks     | SIM       |
| profiles  | SIM       |
| teams     | SIM       |

**Resultado: RLS habilitada em todas as 5 tabelas públicas.** Nenhuma tabela exposta sem proteção.

---

## 2. Policies aplicadas

| Tabela   | Policy                              | Operação | Qual / With_check (resumo)                                          |
|----------|-------------------------------------|----------|----------------------------------------------------------------------|
| groups   | leitura pública                     | SELECT   | `true` (todos leem)                                                  |
| matches  | leitura pública                     | SELECT   | `true`                                                               |
| matches  | update apenas host                  | UPDATE   | `profiles.host = true` com `(SELECT auth.uid())`                     |
| picks    | insert apenas dono com jogo aberto  | INSERT   | `user_id = (SELECT auth.uid())` AND `starts_at > now()`             |
| picks    | select dono ou após apito (anti-cola) | SELECT | `user_id = uid` OR `starts_at < now()`                              |
| picks    | update apenas dono com jogo aberto  | UPDATE   | `user_id = uid` AND `starts_at > now()`                             |
| profiles | insert apenas próprio               | INSERT   | `id = (SELECT auth.uid())`                                          |
| profiles | leitura pública                     | SELECT   | `true`                                                               |
| profiles | update apenas dono                  | UPDATE   | `id = (SELECT auth.uid())`                                           |
| teams    | leitura pública                     | SELECT   | `true`                                                               |

### Avaliação das policies

**Anti-cola (picks SELECT) — FUNCIONA CORRETAMENTE.**

A policy usa `(SELECT auth.uid())` (subquery, não chamada de função por linha), o que evita a avaliação repetida por linha. O padrão está correto conforme boas práticas do Supabase.

Lógica: um usuário autenticado vê seus próprios picks sempre; vê picks de outros somente quando `matches.starts_at < now()` (jogo já iniciado). Usuários anônimos (`auth.uid() IS NULL`) não passam pelo filtro `user_id = uid` e só verão picks de jogos iniciados — comportamento correto para leitura pública do ranking pós-apito.

**Ausência de policy DELETE em picks e profiles** — não existe política de DELETE. Isso significa que `authenticated` não pode deletar suas próprias picks (o `GRANT` concedeu apenas INSERT/UPDATE). Comportamento aceitável para o bolão, mas deve ser documentado explicitamente.

**matches UPDATE** — a verificação de `profiles.host` faz um subquery com `(SELECT auth.uid())`, correto. Porém, ela não usa `WITH CHECK` diferente do `QUAL`, o que é adequado aqui.

---

## 3. Índices

| Índice                | Tabela   | Definição                                           |
|-----------------------|----------|-----------------------------------------------------|
| groups_pkey           | groups   | UNIQUE btree (letter)                               |
| idx_matches_group     | matches  | btree (group_letter)                                |
| idx_matches_starts_at | matches  | btree (starts_at)                                   |
| matches_pkey          | matches  | UNIQUE btree (id)                                   |
| idx_picks_match_id    | picks    | btree (match_id)                                    |
| idx_picks_user_id     | picks    | btree (user_id)                                     |
| picks_pkey            | picks    | UNIQUE btree (user_id, match_id)                    |
| profiles_pkey         | profiles | UNIQUE btree (id)                                   |
| teams_pkey            | teams    | UNIQUE btree (code)                                 |

### Análise de cobertura de Foreign Keys

| FK                          | Indexed? |
|-----------------------------|----------|
| matches.group_letter → groups | SIM (idx_matches_group) |
| matches.team_a → teams       | NAO — falta índice      |
| matches.team_b → teams       | NAO — falta índice      |
| picks.user_id → profiles     | SIM (idx_picks_user_id) |
| picks.match_id → matches     | SIM (idx_picks_match_id)|

**Problema:** `matches.team_a` e `matches.team_b` não têm índices. Com apenas 72 linhas na fase de grupos o impacto atual é negligenciável, mas é uma lacuna de boas práticas. Se a tabela crescer (fase eliminatória, edições futuras), joins por time sofrerão.

### Índice crítico da policy anti-cola

A policy SELECT de `picks` filtra via `EXISTS (SELECT 1 FROM matches WHERE matches.id = picks.match_id AND matches.starts_at < now())`. Esse join usa `picks.match_id` (coberto por `idx_picks_match_id`) e `matches.id` (PK). Não há coluna de `starts_at` em `picks`, portanto o índice `idx_matches_starts_at` não é usado nesse caminho — o banco resolve pelo join de PK, o que é eficiente.

---

## 4. Contagem de linhas

| Tabela   | Rows |
|----------|------|
| teams    | 48   |
| groups   | 12   |
| matches  | 72   |
| profiles | 1    |
| picks    | 0    |

Seed aplicado corretamente: 48 seleções, 12 grupos, 72 partidas. Nenhum palpite cadastrado ainda (esperado — bolão ainda não abriu para participantes).

---

## 5. Trigger `handle_new_user`

**Problema identificado:** a query em `information_schema.triggers` retornou 0 linhas para `handle_new_user`. O trigger está definido no schema `auth` (tabela `auth.users`), não em `public`, portanto não aparece na query restrita a `event_object_schema = 'public'`.

Verificação via migration `0001_schema.sql` confirma que o trigger foi definido como:

```sql
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

A função `handle_new_user()` existe em `public` (confirmado pela migration). O trigger está em `auth.users`. A query de inspeção precisaria buscar em `information_schema.triggers` sem filtro de schema, ou usar `pg_trigger` diretamente. O fato de existir 1 profile (mmartinho.br) gerado automaticamente confirma que o trigger está **funcionando em produção**.

**Recomendação:** adicionar à rotina de QA a query abaixo para verificar o trigger no schema correto:

```sql
SELECT trigger_name, event_object_schema, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## 6. View `ranking` — comportamento com dados

Com 0 picks e 1 profile, a view retornou **1 linha** (não 0):

```json
{ "id": "eb75d1d1...", "name": "mmartinho.br", "score": 0, "resolved": 0, "total_picks": 0 }
```

Comportamento correto: o LEFT JOIN em `profiles` garante que todos os participantes aparecem no ranking mesmo sem palpites, com `score = 0`. Isso é o esperado para o bolão — o ranking mostra todos os participantes desde o início.

**Atenção:** a view usa `count(*) filter (where pk.pick = m.result)`. Quando `m.result IS NULL` (jogo sem resultado), o filtro nunca é verdadeiro, então `score` não é inflado. Correto.

---

## 7. Performance — EXPLAIN ANALYZE em `matches ORDER BY starts_at`

```
Limit  (cost=0.14..1.36 rows=20 width=44)
  ->  Index Scan using idx_matches_starts_at on matches  (cost=0.14..4.52 rows=72 width=44)
```

**Resultado: idx_matches_starts_at sendo usado corretamente.** Nenhum Seq Scan. O planner escolheu Index Scan para a ordenação por `starts_at`.

---

## 8. Análise de `pg_stat_user_tables` (tabelas públicas)

| Tabela   | seq_scan | idx_scan | Observação                              |
|----------|----------|----------|-----------------------------------------|
| groups   | 5        | 86       | Saudável — uso predominante por índice  |
| matches  | 20       | 73       | seq_scan aceitável para 72 linhas       |
| picks    | 13       | 4        | Picks vazia; seq_scans são do planner   |
| profiles | 14       | 10       | 1 linha; seq_scan barato                |
| teams    | 6        | 193      | Excelente — quase todo acesso por índice|

Nenhuma tabela pública apresenta sequencial scan preocupante no volume atual.

---

## 9. Decisão sobre `picks.SELECT` — manter ou restringir?

**Política atual:** dono vê sempre; outros veem apenas jogos cujo `starts_at < now()`.

**Opção A — Manter como está (recomendado).**

Vantagens:
- Permite ao participante ver e editar seus próprios palpites antes do apito.
- Pós-apito, todos os palpites do jogo ficam visíveis — essencial para o ranking funcionar corretamente e para os participantes compararem resultados.
- A view `ranking` acessa `picks` diretamente; se a policy restringisse somente agregados via view, a view ainda seria executada como `authenticated` e teria acesso idêntico. Não há ganho de segurança real.

**Opção B — Restringir a agregado via view.**

Desvantagens:
- Quebraria a cartela pessoal: o usuário não conseguiria ver seus próprios picks futuros via query direta, apenas via UI que usa view.
- A view `ranking` precisa de acesso às linhas individuais de `picks` para calcular `score` por `user_id` — um filtro de policy que bloqueie leitura individual quebraria a view ou exigiria `SECURITY DEFINER`.
- Complexidade adicional sem ganho de segurança tangível no contexto de um bolão familiar.

**Decisão: manter a policy atual.** A lógica anti-cola já implementada é suficiente. A restrição por view introduziria complexidade desnecessária e potencialmente quebraria funcionalidades.

---

## 10. Top 5 Issues + Fix SQL

### Issue 1 — CRITICO: Trigger `on_auth_user_created` não verificável via query padrão

O trigger está em `auth.users` (schema gerenciado pelo Supabase Auth). Se por alguma razão o trigger for perdido em uma re-criação de projeto ou reset, novos usuários não terão profile criado automaticamente.

**Fix: adicionar verificação explícita no CI/deploy:**

```sql
-- Verificar existência do trigger (rodar como service_role ou postgres)
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_table = 'users';
-- Deve retornar 1 linha. Se 0 linhas, recriar:
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Issue 2 — MEDIO: FK `matches.team_a` e `matches.team_b` sem índice

Com 72 jogos o impacto é mínimo agora, mas é lacuna de boas práticas.

```sql
CREATE INDEX IF NOT EXISTS idx_matches_team_a ON public.matches (team_a);
CREATE INDEX IF NOT EXISTS idx_matches_team_b ON public.matches (team_b);
```

### Issue 3 — MEDIO: Sem policy DELETE em `picks`

Participantes não podem deletar seus próprios palpites antes do apito. Pode ser intencional (imutabilidade após INSERT), mas deve ser decisão explícita documentada.

**Fix (caso queira permitir deleção antes do apito):**

```sql
CREATE POLICY "picks: delete apenas dono com jogo aberto"
  ON public.picks FOR DELETE
  USING (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = picks.match_id
        AND matches.starts_at > now()
    )
  );
```

### Issue 4 — BAIXO: Índice parcial para a query anti-cola

A policy de picks SELECT faz join com `matches` filtrando `starts_at < now()`. Um índice parcial em `matches` para jogos já iniciados beneficiaria queries de ranking pós-apito quando o número de participantes crescer.

```sql
CREATE INDEX IF NOT EXISTS idx_matches_started
  ON public.matches (id)
  WHERE starts_at < now();
-- Nota: índices com now() são expressões voláteis e não são aceitos
-- pelo Postgres diretamente. A alternativa é um índice funcional estático
-- ou simplesmente confiar no idx_matches_starts_at + index scan.
-- Com 72 jogos, o ganho é irrelevante. Reavaliar se escalar.
```

**Alternativa real para o índice anti-cola (compatível com Postgres):**

```sql
-- Índice composto em picks para cobrir a policy sem join:
-- Já coberto pela combinação idx_picks_match_id + matches_pkey.
-- Nenhuma ação necessária no volume atual.
```

### Issue 5 — BAIXO: `ranking` view sem RLS / sem proteção explícita

A view `ranking` é pública (SELECT grant para `anon` e `authenticated`). Ela expõe `id` (UUID), `name`, `initials`, `emoji`, `host`, `score` de todos os participantes. Isso é intencional para o bolão, mas se a intenção futura for ocultar scores antes do encerramento, a view precisará de filtro ou RLS via `security_invoker`.

**Fix caso queira ocultar scores intermediários:**

```sql
-- Recriar view com SECURITY INVOKER e adicionar filtro por fase:
CREATE OR REPLACE VIEW ranking
  WITH (security_invoker = true)
AS
  SELECT
    p.id, p.name, p.initials, p.emoji, p.host,
    count(*) FILTER (WHERE pk.pick = m.result AND m.result IS NOT NULL) AS score,
    count(*) FILTER (WHERE m.result IS NOT NULL)                        AS resolved,
    count(pk.match_id)                                                   AS total_picks
  FROM profiles p
  LEFT JOIN picks   pk ON pk.user_id  = p.id
  LEFT JOIN matches m  ON m.id        = pk.match_id
  GROUP BY p.id, p.name, p.initials, p.emoji, p.host
  ORDER BY score DESC NULLS LAST;
-- Com security_invoker, a view respeita as policies RLS do usuário
-- que a consulta, não do definer.
```

---

## 11. Recomendações gerais

1. **Adicionar migração `0004_indexes_fk.sql`** com os índices em `team_a` e `team_b` (Issue 2).
2. **Documentar explicitamente** a ausência de DELETE em picks como decisão de design.
3. **Verificação de trigger no CI**: incluir a query de checagem do `on_auth_user_created` como healthcheck pós-deploy.
4. **Quando ultrapassar 50 participantes**: avaliar `MATERIALIZED VIEW` para `ranking` com `pg_cron` ou refresh manual via RPC, ou mover a agregação para a camada de aplicação com cache Redis.
5. **Sem OFFSET pagination**: o acesso ao ranking é por `ORDER BY score DESC` sem OFFSET — correto para o volume esperado.
6. **Sem SELECT * em produção**: verificar que as queries do frontend especificam colunas explícitas.

---

## Resumo executivo

| Area               | Status       | Notas                                          |
|--------------------|--------------|------------------------------------------------|
| RLS habilitada     | OK           | Todas as 5 tabelas protegidas                  |
| Anti-cola          | OK           | Policy com (SELECT auth.uid()) — correto       |
| Trigger new_user   | OK*          | Funciona (1 profile existente); verificar CI   |
| View ranking       | OK           | LEFT JOIN correto, 0 picks = score 0           |
| idx_matches_starts_at | OK        | Usado no EXPLAIN ANALYZE                       |
| FK team_a/team_b   | ATENCAO      | Sem índice (baixo impacto no volume atual)     |
| DELETE picks       | INDEFINIDO   | Sem policy — intencional?                      |
| Performance geral  | OK           | Nenhum Seq Scan problemático detectado         |
