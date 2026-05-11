# ARCHITECTURE — Bolão Neca & Yomar Copa 2026

Sprint 0 · 2026-05-11 · Refina `PLAN.md`. Não adiciona requisitos novos.

---

## 1. Diagrama de Componentes

```
Browser (PWA installable)
   │
   ▼
Vercel Edge (Next.js 15 App Router)
   ├─ RSC: capa, grupos, tabela, regulamento, perfil
   └─ Client Islands: palpite, ranking-live, share, login

Vercel  ⇄  Supabase
            ├─ Postgres
            │    ├─ teams, groups, matches
            │    ├─ profiles (1:1 auth.users)
            │    ├─ picks
            │    └─ view "ranking" (agregada, security definer)
            ├─ Auth (magic-link email)
            ├─ Realtime channel `ranking-live`
            │    (browser ↔ Supabase WS direto, NÃO passa por Vercel)
            └─ RLS time-gated (anti-cola)
```

---

## 2. Server vs Client Components

| Tela                       | Tipo            | Realtime            |
|----------------------------|-----------------|---------------------|
| 1 Capa                     | RSC estático    | não                 |
| 6 Grupos                   | RSC estático    | não                 |
| 7 Tabela                   | RSC + ISR       | não                 |
| 10 Regulamento             | RSC estático    | não                 |
| 3 Ranking                  | RSC + ilha cliente | sim (Supabase channel) |
| 9 Perfil participante      | RSC + ISR       | não                 |
| 2 Palpite (mobile)         | Client          | optimistic write    |
| 4 Share (mobile)           | Client          | não                 |
| 5 Login (mobile)           | Client          | não                 |
| 8 Jogo do dia (mobile)     | Client          | optimistic write    |

Regra: páginas que dependem de `auth.uid()` são Client (ou Dynamic Server). Tudo que é boletim/leitura agregada é RSC.

---

## 3. Estratégia de Cache por Rota

| Rota              | Modo            | Justificativa                                  |
|-------------------|-----------------|------------------------------------------------|
| `/`               | static          | conteúdo editorial fixo até o sorteio          |
| `/grupos`         | static          | atualiza só quando admin edita grupos          |
| `/regulamento`    | static          | texto institucional                            |
| `/tabela`         | ISR 300 s       | admin marca resultados; staleness ≤ 5 min OK   |
| `/ranking`        | dynamic no-store | scores mudam toda hora; ilha cliente subscribe |
| `/m/palpite`      | dynamic         | depende de `auth.uid()`                        |
| `/m/jogo/[id]`    | dynamic         | depende de `auth.uid()`                        |
| `/[participante]` | ISR 60 s        | perfil público, picks revelados após apito     |

Para `/tabela` e `/[participante]`, revalidação on-demand via `revalidateTag` quando admin grava resultado.

---

## 4. Anti-cola (RLS time-gated)

Política SQL chave (a ser implementada por database-reviewer):

```sql
create policy picks_self_or_started on picks for select using (
  user_id = auth.uid()
  OR exists (
    select 1 from matches m
    where m.id = picks.match_id and m.starts_at <= now()
  )
);
```

`picks INSERT/UPDATE`: só dono e só se `matches.starts_at > now()`.

View `ranking` é `security definer` retornando apenas agregados (`score`, `resolved`, `name`, `initials`). Garante ranking ao vivo sem vazar palpites individuais.

Teste de bypass obrigatório no Sprint 3:
- Playwright autenticado como user A tenta ler `picks` de user B antes do apito → 403/0 rows.
- Após `starts_at < now()` → linhas visíveis.
- UPDATE `matches.result` por não-host → falha.

---

## 5. Tipografia — Decisão: **TROCAR AGORA**

**Bradesco Sans** é fonte interna do Bradesco. Sem licença pública para uso externo. Risco alto (marca + jurídico).

**Adotar:** `Inter Tight` (Google Fonts) + `Geist Mono` (Google Fonts).

- Inter Tight tem corte editorial com `font-stretch` ajustável para simular o "Condensed".
- Fallback chain em `tokens.css`:
  ```css
  --font-sans: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --font-cond: "Inter Tight", var(--font-sans);  /* uso font-stretch: 75% */
  --font-mono: "Geist Mono", ui-monospace, monospace;
  ```
- Bradesco Sans só roda local em `_design/` para preservar fidelidade do mock original. Não vai para `public/fonts`.

**Sobrescreve PLAN.md §2 (linha "Bradesco Sans local")**.

---

## 6. Realtime vs Polling — Decisão: **Supabase Realtime**

Cenário pico: 30 usuários × 90 min ativos × 1 msg/min = ~2.700 msgs/sessão. Supabase free permite 200 conexões concorrentes e 2 M msgs/mês. Folga >1000x.

Polling 30 s: 30 users × 120 req/h × Vercel function = ~3.600 invocações/h, consome quota Vercel functions + egress.

Vencedor: **Realtime channel `ranking-live`**. Browser conecta direto via WS — zero load em Vercel.

Fallback: polling 60 s do view `ranking` se WS handshake falhar (detecção via `channel.subscribe(status => ...)`).

---

## 7. Deploy

- **Branch `main`** → Vercel auto-deploy **Preview** (`*-git-main.vercel.app`).
- **PRs** → Preview isolado por branch (URL única).
- **Promote manual** via Vercel dashboard → Produção (`bolao-neca-yomar.vercel.app`).
- Env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — preview + prod.
  - `SUPABASE_SERVICE_ROLE_KEY` — **prod only**, nunca prefixo `NEXT_PUBLIC_`.
- **Migrations**: `supabase db push` via GitHub Action no merge a `main`.

---

## 8. ADRs Futuros (a escrever conforme Sprint avança)

1. **ADR-001** — Supabase escolhido sobre Cloudflare D1: combo auth+RLS+realtime vence custo marginal.
2. **ADR-002** — Inter Tight substitui Bradesco Sans: risco licencial obriga troca.
3. **ADR-003** — Realtime channel para ranking: economiza Vercel egress vs polling.
4. **ADR-004** — RLS time-gated em `picks`: política SQL bloqueia leitura antes do apito.
5. **ADR-005** — ISR 300 s em `/tabela`: balanceia frescor pós-admin com cache hit ratio.

---

## 9. Boundaries de risco

| Risco                                       | Mitigação                                  |
|---------------------------------------------|--------------------------------------------|
| Service-role key vazar pro browser          | Lint custom proíbe `process.env.SUPABASE_SERVICE_ROLE_KEY` fora de `app/api/**` e `lib/supabase/server.ts`. |
| RLS desligado em produção                   | Migration `0002_rls.sql` é idempotente; CI grep verifica `enable row level security` em cada CREATE TABLE. |
| Bypass via PostgREST function `security definer` | DBA documenta toda função com `security definer` em `supabase/README.md`; review obrigatório. |
| Realtime channel sem auth                   | `realtime.list_changes` exige RLS — mesma policy aplica. |
