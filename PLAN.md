# Bolão Neca & Yomar — Copa 2026
## Plano Completo de Implementação

Data: 2026-05-11 · Autor: Marcelo Martinho · Design source: Variação 3 ("Boletim Familiar")

---

## 1. Visão & Escopo

Bolão familiar baseado nas regras do Excel `bolão.copa.2022.xlsx`, atualizado para Copa 2026 (48 seleções, 12 grupos A–L, 72 jogos da fase de grupos, 11–26 jun 2026).

**Regras herdadas (Excel):**
- 1 palpite por jogo: `1` / `X` / `2`.
- 1 ponto por acerto. Vence quem somar mais pontos.
- Empate → prêmio rateado igualmente.
- Inscrição gratuita.
- Premiação atualizada (design): **1º R$ 10.000** · **2º R$ 5.000**.

**Variação 3 escolhida:** estética "boletim de família" — papel creme, tinta navy, faixa verde/dourado/azul (TriRule), carimbos, fontes Bradesco Sans Condensed + Geist Mono.

**10 telas alvo:**
1. Capa do boletim (desktop)
2. Cartela do dia — celular (Palpite)
3. Pág. 3 — Ranking (desktop)
4. Cartela carimbada — celular (Share)
5. Entrar — celular (Login)
6. Pág. 2 — Os 12 grupos (desktop)
7. Pág. 4 — Tabela completa (desktop)
8. Jogo do dia — celular
9. Pág. 5 — Cartela do participante (desktop)
10. Pág. 6 — Regulamento (desktop)

---

## 2. Stack Técnica

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/ISR grátis na Vercel, RSC reduz bundle |
| Estilo | **Tailwind CSS + tokens.css (oklch)** | Replica direto var3 sem reescrever |
| Fontes | Bradesco Sans (.woff local) + Geist Mono (Google) | Já no bundle de design |
| DB + Auth + Realtime | **Supabase (free tier)** | Postgres + RLS + magic-link auth + 500 MB grátis |
| Hosting | **Vercel Hobby (free)** | 100 GB egress/mês, deploy via Git, domínio `*.vercel.app` |
| Domínio | `bolao-neca-yomar.vercel.app` (grátis) ou `.com.br` (~R$40/ano, opcional) | Família reconhece domínio próprio |
| CI | GitHub Actions free | Lint + test + type-check |
| Monitoramento | Vercel Analytics (free) + Sentry free tier (5k events) | Erros + Web Vitals |

**Custo total esperado: R$ 0/mês** (R$ 40/ano apenas se quiser domínio próprio).

**Alternativa ultra-econômica:** Cloudflare Pages + D1 (SQLite) + Workers. Mais barato para escala, porém auth custa esforço extra. Mantemos Supabase pelo combo auth+RLS+realtime pronto.

---

## 3. Modelo de Dados (Supabase Postgres)

```sql
-- Seleções
create table teams (
  code text primary key,           -- BRA, ARG, ...
  name text not null,
  colors text[] not null            -- 3 cores hex
);

-- Grupos
create table groups (
  letter text primary key,         -- A..L
  teams text[] not null             -- 4 team codes
);

-- Jogos da fase de grupos
create table matches (
  id int primary key,               -- 1..72
  group_letter text references groups(letter),
  round int not null,               -- 1..3
  team_a text references teams(code),
  team_b text references teams(code),
  starts_at timestamptz not null,   -- BRT
  city text,
  result char(1) check (result in ('1','X','2'))  -- null até apitar
);

-- Participantes (auth.users do Supabase + perfil)
create table profiles (
  id uuid primary key references auth.users(id),
  name text not null,
  initials text,
  emoji text,
  host bool default false,
  created_at timestamptz default now()
);

-- Palpites
create table picks (
  user_id uuid references profiles(id),
  match_id int references matches(id),
  pick char(1) check (pick in ('1','X','2')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, match_id)
);

-- Ranking materializado (view)
create view ranking as
  select p.id, p.name, p.initials, p.host,
         count(*) filter (where pk.pick = m.result) as score,
         count(*) filter (where m.result is not null) as resolved
  from profiles p
  left join picks pk on pk.user_id = p.id
  left join matches m on m.id = pk.match_id
  group by p.id;
```

**RLS policies:**
- `profiles`: SELECT público; UPDATE só dono.
- `picks`: SELECT dono próprio sempre; SELECT de outros **somente após `matches.starts_at < now()`** (anti-cola).
- `matches`/`teams`/`groups`: SELECT público; UPDATE só `host=true`.

---

## 4. Estrutura de Pastas

```
D:\BolaoNecaYomar\
├── app/
│   ├── layout.tsx                # fontes + tokens
│   ├── page.tsx                  # capa do boletim (tela 1)
│   ├── grupos/page.tsx           # tela 6
│   ├── tabela/page.tsx           # tela 7
│   ├── ranking/page.tsx          # tela 3
│   ├── regulamento/page.tsx      # tela 10
│   ├── [participante]/page.tsx   # tela 9 (perfil)
│   └── m/                        # mobile-first
│       ├── login/page.tsx        # tela 5
│       ├── palpite/page.tsx      # tela 2
│       ├── jogo/[id]/page.tsx    # tela 8
│       └── share/page.tsx        # tela 4
├── components/
│   ├── boletim/{BBrand,TriRule,Stamp,bBtn}.tsx
│   ├── Flag.tsx, Avatar.tsx, BallMark.tsx, Icon.tsx
│   └── ui/...
├── lib/
│   ├── supabase/{server,client,middleware}.ts
│   ├── db/{teams,matches,picks,ranking}.ts
│   └── score.ts                  # cálculo de ranking + premiação
├── public/fonts/BradescoSans-*.woff
├── styles/tokens.css             # copiado do design
├── scripts/seed.ts               # popula teams/groups/matches
└── tests/{unit,e2e}/
```

---

## 5. Sprint Plan (4 sprints, ~2 semanas cada)

### Sprint 1 — Fundação
- Bootstrap Next.js + Tailwind + tokens.css
- Setup Supabase project + schema + seed (48 teams, 12 groups, 72 matches)
- Auth magic-link (email) — tela 5 (Login)
- Pipeline GitHub→Vercel
- Componentes base (BBrand, TriRule, Stamp, Flag, Avatar, Icon)

### Sprint 2 — Telas estáticas (desktop)
- Tela 1: Capa do boletim
- Tela 6: Os 12 grupos
- Tela 7: Tabela completa de 72 jogos
- Tela 10: Regulamento

### Sprint 3 — Fluxo de palpite + ranking
- Tela 2: Cartela do dia (mobile, swipe entre jogos)
- Tela 8: Jogo do dia (detalhe)
- Tela 4: Compartilhar PNG/WhatsApp (canvas server-side ou html-to-image)
- Tela 3: Ranking ao vivo (subscribe via Supabase Realtime)
- Tela 9: Perfil participante

### Sprint 4 — Polimento e operação
- Admin (host): marcar resultado, fechar palpites
- Notificações: lembrete de cartela aberta (Web Push opcional)
- A11y, Lighthouse ≥ 90, E2E Playwright golden path
- PWA installable (ícone, manifest)

---

## 6. Time de Agentes Especialistas

Cada agente abaixo é invocado via `Agent(subagent_type=...)` no Claude Code:

| # | Agente | Responsabilidade | Quando |
|---|---|---|---|
| 1 | **ecc:architect** | Validar stack, blast radius decisions | Sprint 0 |
| 2 | **ecc:planner** | Quebrar PRD em PRs pequenos | Início cada sprint |
| 3 | **ecc:database-reviewer** | Schema, RLS, índices, anti-cola | Sprint 1 |
| 4 | **ecc:typescript-reviewer** | Code review Next.js/TS | Cada PR |
| 5 | **ecc:tdd-guide** | Vitest unit tests (score calc, RLS sim) | Sprint 1+ |
| 6 | **ecc:security-reviewer** | Auth, secrets, RLS bypass, XSS | Sprint 1, 3, 4 |
| 7 | **ecc:e2e-runner** | Playwright: login → palpite → ranking | Sprint 3, 4 |
| 8 | **ecc:performance-optimizer** | Bundle, fonts, ISR, Lighthouse | Sprint 4 |
| 9 | **ecc:code-reviewer** | Review genérico final por PR | Cada PR |
| 10 | **ecc:doc-updater** | README, manual da família, CODEMAPS | Sprint 4 |
| 11 | **Explore** (paralelo) | Localizar refs no repo durante refactor | Conforme necessário |
| 12 | **cc-gemini-plugin:gemini-agent** | Auditoria 1M-token de fidelidade ao design | Sprint 2 e 4 |

**Orquestração:** rodar agentes em paralelo onde independente (ex: typescript-reviewer + database-reviewer + security-reviewer no mesmo PR).

---

## 7. Roadmap de Entrega

| Marco | Data alvo | Saída |
|---|---|---|
| M1 — Fundação live | +14 dias | URL pública, login funcional, schema seedado |
| M2 — Boletim navegável | +28 dias | 4 telas desktop estáticas no ar |
| M3 — Palpite + Ranking | +42 dias | Família já pode palpitar (jogos fictícios) |
| M4 — Pronto pra Copa | +56 dias (antes de 11 jun 2026) | PWA, admin, share, tests, A11y |

---

## 8. Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| Supabase free 500 MB esgotar | Estimativa: 9 família × 72 picks = 648 rows. Folga enorme. |
| Vercel egress > 100 GB | ISR + Edge caching; ranking realtime via Supabase channel (não toca Vercel). |
| Domínio bradescosans (fonte interna Bradesco) | **Verificar licença antes de produção**. Plano B: Inter (Google Fonts) + variant Condensed. |
| Sorteio real da Copa só em dez/2025 | Modelar grupos como dados editáveis; admin atualiza após sorteio. |
| Anti-cola (ver palpite alheio antes do apito) | RLS policy descrita em §3. Test de bypass no Sprint 3. |
| Família sem app store | PWA installable resolve sem App Store/Play. |

---

## 9. Próximos passos (executar nesta ordem)

1. Aprovar este plano (você).
2. Criar repositório GitHub `bolao-neca-yomar`.
3. Spawnar `ecc:architect` para validar §2 e §3.
4. Spawnar `ecc:planner` para gerar Sprint 1 detalhado.
5. Bootstrapping Next.js + Supabase (Sprint 1 começa).

---

## Apêndice A — Tokens de design (copiar tal qual de `_design/.../tokens.css`)

`--font-sans: "Bradesco Sans"` · `--font-cond: "Bradesco Sans Condensed"` · `--font-mono: "Geist Mono"`
Cores chave Variação 3: `paper #fbfaf4` · `ink #0b2c5c` · `green #0b6b3a` · `gold #c79410` · `blue #0b2c5c`

## Apêndice B — Dados fixos para seed (12 grupos)

```
A: MEX, COL, NOR, UZB
B: CAN, BEL, TUN, NZL
C: USA, CRO, PAR, JOR
D: BRA, SUI, SEN, KSA
E: ARG, JPN, EGY, CPV
F: FRA, DEN, NGA, PAN
G: ESP, KOR, CIV, JAM
H: ENG, POL, ALG, RSA
I: GER, ECU, CMR, QAT
J: POR, URU, IRN, AUS
K: ITA, SRB, MAR, TUR
L: NED, AUT, GHA, CRC
```
(Placeholder — sorteio oficial dez/2025 vai ajustar.)
