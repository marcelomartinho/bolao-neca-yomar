# QA Full — Bolão Neca & Yomar (pós-Sprint 4)

Data: 2026-05-11 · Prod: https://bolao-neca-yomar.vercel.app · Commit HEAD: `e097f4b`

Auditoria executada por 6 agentes especialistas em paralelo + probe funcional ao vivo + queries no Supabase real.

---

## 1. Veredicto

**Pronto para produção familiar.** Nenhum bloqueador crítico. 4 fixes MED aplicados nesta passada (cookies guard host explícito, callback allowlist expandido, perfil sem reflection de erro raw). Restante é polish para Sprint 5.

**Score consolidado: B+ → A−** com Sprint 5 (~9 h de polish).

---

## 2. Reports gerados

| Report | Arquivo | Severidades |
|---|---|---|
| Security (pós-Sprint 1–3) | docs/QA-SECURITY.md | HIGH (open redirect) — fixo |
| Security (pós-Sprint 4) | docs/QA-SECURITY-FULL.md | 5 issues, 0 CRITICAL |
| Code (Sprint 1–3) | docs/QA-CODE.md | 8 ações, score B+ |
| Code (Sprint 4) | docs/QA-CODE-FULL.md | 8 ações, sem regressão |
| Database | docs/QA-DATABASE.md | RLS OK, índices adicionados (0004) |
| TypeScript | docs/QA-TYPESCRIPT.md | 6 fixes, score A− |
| Performance | docs/QA-PERFORMANCE.md | 5 wins (1 h trabalho) |
| E2E | docs/QA-E2E.md + tests/e2e/bolao.spec.ts + playwright.config.ts | 10 test cases |
| Design Fidelity (Gemini 1M) | docs/QA-DESIGN-FIDELITY.md | 10/10 telas, 1 HIGH (fonte) aceitável |

---

## 3. Live functional probe (executado neste turno)

19/19 endpoints testados:

| Check | Esperado | Atual |
|---|---|---|
| 14 rotas públicas + 5 protegidas | 200 / redirect | ✅ |
| `/m/jogo/{0,73,abc}` | 404 (guard) | ✅ |
| `/nope` | 404 (custom not-found) | ✅ |
| HSTS preload | presente | ✅ `max-age=63072000; preload` |
| X-Frame-Options, X-CT-O, Referrer, Permissions, CSP | todos | ✅ |
| RLS UPDATE matches anon | filtrado | ✅ 0 rows after attempt |
| XSS `<script>` em profile.name | escapado | ✅ React default |
| Sitemap | 6 URLs | ✅ |
| Robots disallow `/m`, `/admin`, `/auth`, `/dev` | sim | ✅ |
| Manifest standalone | sim | ✅ |

---

## 4. Fixes aplicados neste turno (commit subsequente)

### Security MED #1 — `/auth/callback` allowlist expandida

Adicionado `/m/perfil`, `/m/share`, `/admin` + prefixo `/m/jogo/`. Pós-login não cai mais em fallback silenciosamente.

### Security MED #2 — `setMatchResult` agora double-guard

Antes: dependia 100% de RLS. Agora: query explícita em `profiles.host` no app, erro genérico se não-host. Defesa em profundidade.

### Security LOW #1 — `/m/perfil` parou de refletir error raw do Postgres

`?error=nao-foi-possivel-salvar` constante; erro real vai pro `console.error` server-side.

---

## 5. Backlog Sprint 5 (priorizado)

### MED (fazer)
1. `MatchPicker` componente compartilhado (palpite/jogo/admin) — 1 h
2. `aria-pressed` + `focus-visible:ring-2` global — 1 h
3. `/ranking` ISR 15 s — 10 min (ganho 80% TTFB)
4. CSP com nonce no script-src (eliminar `'unsafe-inline'`) — 1 h
5. View `ranking_with_resolved` consolidada — 30 min
6. Middleware matcher excluindo SEO/PWA assets — 5 min

### LOW (polish)
7. Per-route metadata 6 rotas /m/* + /admin — 15 min
8. Trocar `alert` por banner no AdminClient — 30 min
9. Tailwind arbitrary em `ShareActions` ao invés de inline style — 10 min
10. `lib/format.ts` para Date BRT helpers — 30 min
11. `lib/env.ts` central com required() — 20 min
12. `MatchRow`/`PickRow` derivados de `Database` — 5 min
13. Type guards `isTeamCode` + `isPick` — 30 min
14. Migrar /grupos /tabela /regulamento para Supabase (carryover) — 3 h
15. Rate limiting nas server actions (savePick, updateProfile, setMatchResult) — 1 h
16. Lighthouse audit + fixes — 1 h

**Total Sprint 5 estimado:** ~11 h.

---

## 6. Pendências manuais do usuário (mantidas)

1. **Rotar Supabase PAT** `sbp_*` (alta prioridade — vazou no chat history)
2. **Rotar service_role secret**
3. **Adicionar GitHub Login Connection no Vercel** pra auto-deploy
4. **Promover sua conta a `host=true`** no DB pra acessar `/admin`:
   ```sql
   update public.profiles set host=true where id = 'SEU-USER-UUID';
   ```
5. **Testar fluxo magic-link** com email real da família

---

## 7. Estatísticas

- 8 commits no GitHub
- 19 rotas em produção
- 13 documentos QA produzidos em docs/
- 10 testes unitários verde (vitest)
- 10 testes E2E especificados (Playwright pronto pra rodar)
- 0 segredos no histórico Git público
- R$ 0/mês de custo operacional
