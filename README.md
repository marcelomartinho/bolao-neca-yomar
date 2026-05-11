# Bolão Neca & Yomar — Copa 2026

Boletim e cartela do bolão familiar da Copa do Mundo 2026.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 + tokens.css (Variação 3 "Boletim Familiar")
- Supabase (Postgres + Auth magic-link + Realtime + RLS)
- Vercel Hobby (deploy)
- Fontes: Inter Tight + Geist Mono via `next/font/google`

## Dev

```bash
pnpm install
cp .env.example .env.local       # popula com chaves do Supabase
pnpm dev                          # http://localhost:3000
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Docs

- [PLAN.md](./PLAN.md) — visão geral, regras, time de agentes
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — arquitetura técnica + ADRs
- [docs/SPRINT1.md](./docs/SPRINT1.md) — backlog Sprint 1 (Fundação)
- [supabase/README.md](./supabase/README.md) — schema, RLS, seed _(em construção)_

## Status

Sprint 1 — Fundação. PR1 (bootstrap) em andamento.
