# Sprint 1 — Fundação · Bolão Neca & Yomar Copa 2026

Meta: repo público no ar, login funcional, schema seedado, design system base instalado.

> **Override de PR2 (ver ARCHITECTURE.md §5):** trocamos Bradesco Sans → **Inter Tight + Geist Mono (Google Fonts)**. PR2 abaixo reflete o plano original; ler junto com ARCHITECTURE.md.

---

## PR1 — Bootstrap Next.js 15 + TS + Tailwind + lint
- **Branch:** `feat/bootstrap`
- **Arquivos:**
  - `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`
  - `.eslintrc.json`, `.prettierrc`, `.gitignore`, `.editorconfig`
  - `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
  - `README.md`
- **Done:** `pnpm dev` sobe `localhost:3000` mostrando "Bolão Neca & Yomar"; `pnpm lint`, `pnpm typecheck`, `pnpm build` rodam sem erro.
- **Estimativa:** 2h
- **Dep:** nenhuma

## PR2 — Tokens.css + tipografia
- **Branch:** `feat/design-tokens`
- **Arquivos:**
  - `app/layout.tsx` (carregar Inter Tight + Geist Mono via `next/font/google`)
  - `styles/tokens.css` (portar de `_design/.../tokens.css`, trocar `--font-sans/cond/mono` para Inter Tight + Geist Mono; remover `@font-face` Bradesco)
  - `tailwind.config.ts` (`fontFamily: { sans, cond, mono }` apontando para CSS vars)
- **Bradesco Sans:** NÃO copiar pra `public/fonts`. Manter só em `_design/` p/ referência de fidelidade.
- **Done:** página raiz renderiza com font-family Inter Tight; `font-cond` usa `font-stretch: 75%`; DevTools Network mostra fontes Google carregadas; zero FOUT >100 ms.
- **Estimativa:** 2 h
- **Dep:** PR1

## PR3 — Supabase wiring + env scaffolding
- **Branch:** `feat/supabase-clients`
- **Arquivos:**
  - `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
  - `.env.local` (gitignored)
  - `lib/supabase/{client,server,middleware}.ts`
  - `lib/supabase/types.ts` (placeholder, regenera no PR4)
  - `docs/SUPABASE_SETUP.md` (passo-a-passo: criar projeto, copiar URL/keys, habilitar email auth)
- **Done:** `lib/supabase/server.ts` retorna cliente tipado em RSC sem erro; `pnpm typecheck` verde; setup reproduzível em <10 min.
- **Estimativa:** 3 h
- **Dep:** PR1

## PR4 — Schema SQL + RLS + seed
- **Branch:** `feat/supabase-schema`
- **Arquivos:**
  - `supabase/migrations/0001_schema.sql` (teams, groups, matches, profiles, picks, view ranking) — saída do database-reviewer agent
  - `supabase/migrations/0002_rls.sql` (anti-cola time-gated)
  - `supabase/migrations/0003_seed.sql` (48 teams + 12 groups + 72 matches)
  - `supabase/README.md` (como aplicar + 3 testes de policy)
  - `scripts/seed.ts` (opcional, alternativa via service role)
  - `lib/supabase/types.ts` (regenerado via `supabase gen types typescript`)
- **Done:** rodar migrations em DB vazio popula 48+12+72 rows; `select * from ranking` retorna 0 rows sem erro; anon a `picks` de outro user antes do apito → 0 rows.
- **Estimativa:** 5 h
- **Dep:** PR3

## PR5 — Componentes base do boletim (Variação 3)
- **Branch:** `feat/components-base`
- **Arquivos:**
  - `components/boletim/{BBrand,TriRule,Stamp}.tsx`
  - `components/{Flag,Avatar,BallMark,Icon}.tsx`
  - `app/_dev/components/page.tsx` (showcase rota só em dev)
- **Done:** rota `/dev/components` renderiza cada componente fidedigno ao `var3.jsx`; zero `any`; props tipadas.
- **Estimativa:** 6 h
- **Dep:** PR2

## PR6 — Auth magic-link + middleware
- **Branch:** `feat/auth-magic-link`
- **Arquivos:**
  - `app/m/login/page.tsx` (tela 5 do PLAN, mobile-first)
  - `app/m/login/actions.ts` (server action `signInWithOtp`)
  - `app/auth/callback/route.ts` (handler de code exchange)
  - `middleware.ts` (refresh sessão SSR)
  - `app/m/logout/route.ts`
- **Done:** submit email → magic-link no inbox Supabase; clicar redireciona pra `/m/palpite` autenticado; `cookies()` em RSC retorna sessão; logout limpa cookie.
- **Estimativa:** 5 h
- **Dep:** PR3, PR4

## PR7 — GitHub Actions CI
- **Branch:** `ci/github-actions`
- **Arquivos:**
  - `.github/workflows/ci.yml` (jobs: install, lint, typecheck, test)
  - `vitest.config.ts`
  - `tests/unit/smoke.test.ts`
  - `package.json` scripts (`test`, `test:watch`)
- **Done:** PR no GitHub dispara Action; 3 jobs verdes em <3 min; Action quebra se lint ou tsc quebrar.
- **Estimativa:** 2 h
- **Dep:** PR1

## PR8 — Vercel deploy preview
- **Branch:** `chore/vercel-deploy`
- **Arquivos:**
  - `vercel.json` (`regions: ["gru1"]`, framework `nextjs`)
  - `.vercelignore`
  - `docs/VERCEL_SETUP.md`
- **Done:** push pra `main` gera deploy `bolao-neca-yomar.vercel.app`; PR gera URL preview; `/m/login` carrega; env vars Supabase no Vercel Dashboard.
- **Estimativa:** 2 h
- **Dep:** PR1, PR3, PR6

---

## Ordem de merge
`PR1` → (`PR2`, `PR3`, `PR7` paralelos) → `PR4` → `PR5` → `PR6` → `PR8`

**Total:** ~27 h (~1,5–2 semanas).

---

## Checklist Sprint 1 done

- [ ] `pnpm dev` sobe sem warning de fonte/CSS
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` verde
- [ ] GitHub Actions verde no último commit de `main`
- [ ] URL pública `bolao-neca-yomar.vercel.app` retorna 200
- [ ] Supabase: 48 teams + 12 groups + 72 matches conferidos
- [ ] RLS: anon não lê `picks` alheios antes do apito
- [ ] Login magic-link end-to-end em produção
- [ ] `/dev/components` mostra BBrand, TriRule, Stamp, Flag, Avatar, BallMark, Icon fidedignos
- [ ] Fontes Inter Tight + Geist Mono via `next/font/google` com swap controlado
- [ ] `.env.example` commitado; `.env.local` no `.gitignore`; nenhum secret no repo
