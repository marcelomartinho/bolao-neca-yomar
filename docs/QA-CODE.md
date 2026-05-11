# QA — Code Review (Sprint 1–3)

Data: 2026-05-11 · Revisor: orquestrador (Opus 4.7)

Codebase: D:\BolaoNecaYomar · 4 commits · Next.js 15.5 + React 19 + TS 5.9 + Tailwind 3.4 + Supabase 0.10.3

---

## 1. Visão geral

Codebase pequeno e coerente: ~1.5k LoC TS/TSX, ~440 LoC SQL, ~3 k LoC docs. Arquitetura limpa: RSC para boletim estático, Client Components apenas onde precisa (`PalpiteClient`). Tokens centralizados em `tailwind.config.ts` + `styles/tokens.css`. Sem dead code aparente.

Build: 13 rotas (6 static, 7 dynamic+ISR), JS shared = 102 kB, middleware = 89 kB. Bundles razoáveis.

---

## 2. Estrutura

```
app/                — App Router
  page.tsx          — capa (RSC)
  grupos/           — pág. 2 (RSC static)
  tabela/           — pág. 4 (RSC ISR 5min)
  ranking/          — pág. 3 (RSC dynamic)
  regulamento/      — pág. 6 (RSC static)
  [participante]/   — pág. 5 (RSC ISR 60s)
  m/login/          — magic-link form + server action
  m/palpite/        — cartela client + savePick action
  m/logout/         — POST handler
  auth/callback/    — OAuth/OTP exchange
  dev/components/   — showcase (NODE_ENV guard)
components/
  boletim/          — BBrand TriRule Stamp BallMark PageHeader PageFooter
  Avatar Flag Icon  — primitives
lib/
  db.ts             — Supabase fetchers
  score.ts          — pure scoring + prize distribution
  static-data.ts    — 48 teams + 12 groups + 72 matches (fallback / fonte canônica)
  supabase/         — client/server/middleware/types
middleware.ts       — session refresh
```

---

## 3. Issues acionáveis

### HIGH

**H1 — Style inline excessivo em `PalpiteClient.tsx` e `ranking/page.tsx`.**
Cor por estado (`pick === "1" ? gColor : "#0b2c5c"`) cria estilo inline; perde benefícios do JIT do Tailwind e do CSP `style-src 'self'` (atualmente permissivo com `'unsafe-inline'`). **Fix:** migrar para `data-` attributes + classes condicionais com `clsx`, ou usar CSS variables.

### MEDIUM

**M1 — `static-data.ts` espelha `supabase/migrations/0003_seed.sql` sem sincronização.**
Duas fontes da mesma verdade (48 teams, 12 groups, 72 matches). Se sorteio real mudar dec/2025, ambos precisam atualizar. **Fix:** marcar `static-data.ts` como deprecated, migrar `/grupos`, `/tabela`, `/regulamento` para usar `lib/db.ts` (RSC fetch + ISR). Mantém o arquivo só pra `<dev>` e seed local.

**M2 — `lib/db.ts` faz `throw new Error()` em queries.**
Erros do Supabase viram exceção que sobe até o boundary. RSC mostra error.tsx genérico. **Fix:** retornar `{ data, error }` típico ou criar `error.tsx` boletim-themed. Adicionar log estruturado (não `console.error` em prod — usar `@sentry/nextjs` no Sprint 4).

**M3 — Sem `not-found.tsx`.**
`/random-uuid` 404 mostra UI padrão do Next sem branding. **Fix:** criar `app/not-found.tsx` boletim-themed.

**M4 — Avatar gera cor por hash, mas sem deterministic seed entre server e client.**
Hash do nome — OK, é deterministic. Mas seria melhor se Supabase tivesse `color` no profile. **Fix:** Sprint 4 adicionar `profile.color` opcional, fallback no hash.

**M5 — Mensagens de erro vão pra URL via `?error=...`.**
Mensagem do Supabase ("Email signup is disabled" etc.) refletida na URL → renderizada no JSX. Atualmente não é XSS (texto puro), mas evitar refletir literal de erro do upstream. **Fix:** mapear códigos do Supabase para mensagens próprias em pt-BR.

### LOW

**L1 — `useTransition` retorna `[isPending, ...]` mas o `_` descarta.**
Estamos usando `savingMatchId` state próprio. Funciona. Podia simplificar removendo `useTransition` e fazer await direto. Cosmético.

**L2 — Magic numbers de cores hardcoded.**
`#0b6b3a`, `#c79410`, `#0b2c5c` aparecem em 8+ arquivos. Tailwind config mapeia mas alguns inline. **Fix:** sweep substituindo por `var(--grass|gold|bluebr)` ou `theme()` em CSS-in-TSX.

**L3 — `formatBRT` / `formatDayBRT` / `dateKeyBRT` em `static-data.ts`.**
Helpers de I18n não pertencem ao dataset. **Fix:** mover para `lib/format.ts`.

**L4 — `app/dev/components/page.tsx` checa `process.env.NODE_ENV === "production"` para `notFound()`.**
Funciona, mas o build prod ainda gera o bundle. **Fix:** mover pra route segmentation `app/(dev)/` ou condicionar em layout. Não-crítico.

---

## 4. Acessibilidade

- **Contraste:** ink `#0b2c5c` em paper `#fbfaf4` ≈ 14:1 (AAA). Verde grass `#0b6b3a` em paper ≈ 7:1 (AAA texto pequeno). Bom.
- **Foco visível:** Tailwind `focus:ring` ausente em botões. Usuários de teclado tem foco padrão do browser. **Fix Sprint 4:** adicionar `focus-visible:ring-2 focus-visible:ring-ink` nos botões.
- **alt text:** Bandeiras renderizam `<span aria-hidden>`, OK (nome do país é visível ao lado). Avatares têm `aria-label={name}`, OK.
- **Headings:** ordem semântica respeita H1 → H2. Bom.
- **`lang="pt-BR"`:** OK em `app/layout.tsx`.
- **Skip-link:** ausente. Não crítico em mobile.

---

## 5. SEO

- **Metadata:** apenas `title` + `description` em root layout. Páginas filhas herdam.
- **`generateMetadata` por rota:** ausente. **Fix:** adicionar título único por rota (Capa, Grupos, Tabela, …) — 1h Sprint 4.
- **OpenGraph / Twitter cards:** ausentes. Sprint 4 — pareia com tela 4 Share.
- **Sitemap:** ausente. **Fix:** `app/sitemap.ts` 30 LoC.
- **robots.txt:** ausente. **Fix:** `app/robots.ts`.

---

## 6. Bundle

| Rota              | Size  | Total First Load |
|-------------------|-------|------------------|
| /m/palpite        | 4.75 kB | 107 kB |
| /                 | 3.44 kB | 106 kB |
| /tabela           | 140 B | 103 kB |
| (todas estáticas) | 140 B | 103 kB |
| shared            | 102 kB | — |
| middleware        | 89 kB | — |

102 kB shared é alto pra família mas aceitável (React 19 RSC + Supabase SSR + Tailwind runtime). Middleware 89 kB também vem do `@supabase/ssr`. Sprint 4 considerar `lite` build do supabase-js se virar gargalo (improvável com 30 users).

---

## 7. Code Smells

- **`PalpiteClient.tsx` 240 LoC:** componente único faz tudo (toolbar + lista + footer). **Fix Sprint 4:** extrair `MatchCard`, `Header`, `Footer` em arquivos próprios.
- **`ranking/page.tsx` 145 LoC mas tem podium + tabela inline:** poderia extrair `Podium` e `LeaderboardRow`. Não-urgente.
- **`[participante]/page.tsx` faz score client-side via reduce sobre `matches+picks`:** funciona porque `fetchMatches()` retorna 72 rows sempre. Não usa view `ranking`. **Fix:** usar `fetchRanking()` filtrado por `id=eq.{id}` (1 query agregada vs 2).

---

## 8. Top 8 ações

| # | Sev | Item | Esforço |
|---|---|---|---|
| 1 | HIGH | Remover style inline de cor por estado em PalpiteClient/Ranking | 2 h |
| 2 | MED | Migrar /grupos /tabela /regulamento p/ fetch Supabase via lib/db | 3 h |
| 3 | MED | Criar `app/not-found.tsx` boletim-themed | 1 h |
| 4 | MED | Mapear erros do Supabase pra mensagens pt-BR no `/m/login` | 1 h |
| 5 | LOW | Mover helpers `formatBRT*` pra `lib/format.ts` | 30 min |
| 6 | LOW | `generateMetadata` + `sitemap.ts` + `robots.ts` | 1 h |
| 7 | LOW | `focus-visible:ring-*` nos botões | 30 min |
| 8 | LOW | Extrair MatchCard, Podium em arquivos próprios | 2 h |

**Total:** ~11 h em Sprint 4 (junto com share + admin + jogo detail).

---

## 9. Conclusão

Código limpo, tipado, testes verde. Sem vulnerabilidades de qualidade que impeçam produção. Issues acima são polimento, não bloqueadores. Bundle dentro do esperado. RSC/Client split adequado.

Score: **B+** — pronto pra família começar a palpitar; Sprint 4 leva pra A.
