# QA — Performance

Data: 2026-05-11 · Prod https://bolao-neca-yomar.vercel.app · Vercel Hobby + Supabase us-west-1

---

## 1. TTFB / Total (curl gzip, edge-cached por Vercel)

| Rota | TTFB | Total | Tipo |
|---|---|---|---|
| `/` | 94 ms | 95 ms | static |
| `/grupos` | 80 ms | 82 ms | static |
| `/tabela` | 83 ms | 86 ms | ISR 5min |
| `/regulamento` | 129 ms | 131 ms | static |
| `/ranking` | **759 ms** | 761 ms | dynamic (Supabase fetch) |
| `/m/login` | 131 ms | 131 ms | dynamic |
| `/sitemap.xml` | 82 ms | 83 ms | static |
| `/icon.svg` | 72 ms | 72 ms | static |
| `/manifest.webmanifest` | 82 ms | 83 ms | static |

**Análise:** estáticas em <150 ms (excelente). `/ranking` em 759 ms — 2 fetches Supabase paralelos (us-west) + render RSC. Dentro do orçamento p/ família mas dá pra melhorar.

---

## 2. Cache Headers

Vercel ativa cache via `Age:` mesmo com `Cache-Control: public, max-age=0, must-revalidate` (típico de RSC). `Age: 628s` em `/` indica edge cache de ~10 min para a página estática. OK.

---

## 3. Bundle (.next/static = 1.2 MB total)

| Chunk | Tamanho | Conteúdo |
|---|---|---|
| framework | 190 kB | React 19 + Next runtime |
| 381 | 173 kB | shared (provavelmente @supabase/ssr) |
| 6d6cfd68 | 173 kB | shared |
| main | 122 kB | app bootstrap |
| polyfills | 113 kB | legacy browsers |
| 383 | 8.5 kB | client islands |
| 568 | 5.4 kB | client islands |
| webpack | 3.5 kB | runtime |

**First Load JS shared = 102 kB.** Aceitável; reduzir só com `@supabase/ssr` mais leve (que não existe hoje) ou code-split agressivo.

---

## 4. Issues

### M1 — `/ranking` 759 ms TTFB

Faz 2 fetches Supabase paralelos. **Causas:**
1. Latência us-west-1 → Vercel gru1 ~150 ms RTT × 2 (paralelo, então ~150 ms total)
2. RSC render time
3. Cold start function (se idle)

**Fix:**
- Curto prazo: trocar `revalidate = 0` (force dynamic) por `revalidate = 15` (ISR 15 s). Aceitar 15 s de staleness pra reduzir 80% das chamadas. Custo: 0 (free tier).
- Médio: criar view `ranking_with_resolved` consolidada que já retorna `resolved` (count das matches com result not null) — elimina o segundo fetch.

### M2 — Middleware 89 kB roda em rotas estáticas

Middleware atual já exclui `_next/static`, `fonts`, imagens. Mas roda em `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg`. **Fix:** expandir matcher:

```ts
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|icon|manifest|sitemap|robots|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
```
Esforço: 5 min. Reduz function invocations no Vercel.

### M3 — `/tabela` renderiza 72 rows × Flag SVG

Cada `Flag` é apenas 3 spans com bg-color. Render cheap. Sem issue.

### L1 — `/m/palpite` 5.15 kB de JS client

Tudo é UI + handlers + state. `useTransition` + `useState`. OK pra mobile 3G/4G (parse <50 ms). Não otimizar até virar gargalo.

### L2 — Fonts Inter Tight + Geist Mono via `next/font`

`display: "swap"` ativo. Bundle dos fontes adicionados ao critical CSS via Next automaticamente. Sem FOIT visível. OK.

### L3 — Sem image optimization usada

Atualmente só temos `app/icon.svg` (PWA icon). Sem `<Image>` em uso. Sprint 5+ se adicionar fotos de jogadores ou bandeiras reais, usar `next/image`.

### L4 — `force-dynamic` em /ranking força run em request

ISR 15 s seria suficiente — picks são salvos via `revalidatePath("/ranking")` no `savePick`, que invalida o cache imediato. Trocar `dynamic = "force-dynamic"` por `revalidate = 15` ou remover ambos (Next infere).

---

## 5. Recomendações priorizadas

| # | Sev | Item | Ganho | Esforço |
|---|---|---|---|---|
| 1 | M | `/ranking` ISR 15 s + `revalidatePath` no savePick (já existe) | TTFB 759 ms → ~100 ms | 10 min |
| 2 | M | Matcher middleware excluindo SEO/PWA assets | -10 a -30% function invocations | 5 min |
| 3 | M | View `ranking_with_resolved` consolidada | -1 round-trip a Supabase | 30 min |
| 4 | L | `<link rel="preconnect" href="https://sdqgosoavqqyhzizptrx.supabase.co">` em layout | reduz handshake do client supabase | 5 min |
| 5 | L | Lighthouse run local (não medido aqui) | identifica restos | 15 min |

**Total wins:** ~1 h pra TTFB ranking ~10x menor + redução de cold starts.

**Não fazer (over-engineer):**
- ❌ Swap @supabase/ssr → ssr-lite (não existe).
- ❌ Code-split agressivo (102 kB shared OK pra família).
- ❌ Service Worker custom (manifest + offline em Sprint 5 talvez).

---

## 6. Lighthouse (não medido — fora do escopo agora)

A rodar manualmente com `npx unlighthouse --site https://bolao-neca-yomar.vercel.app` em Sprint 5.
