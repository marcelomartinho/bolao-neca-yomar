# QA — Code Review (Sprint 4 follow-up)

Data: 2026-05-11 · Baseline: docs/QA-CODE.md (Sprint 1–3)

Cobertura: arquivos novos do Sprint 4
- `app/admin/{page,actions,AdminClient}.tsx`
- `app/m/jogo/[id]/{page,JogoPickerClient}.tsx`
- `app/m/perfil/{page,actions}.{ts,tsx}`
- `app/m/share/{page,ShareActions}.tsx`
- `app/{not-found,sitemap,robots,manifest}.{ts,tsx}`
- `app/icon.svg`
- Metadata per-route em `/grupos`, `/tabela`, `/regulamento`, `/ranking`

---

## 1. Triagem rápida

13 arquivos novos · ~750 LoC adicionados · zero `any`/`@ts-ignore` · build verde (19 rotas) · tests 10/10. `pnpm typecheck` limpo.

Score Sprint 4: **B+** (mesmo de Sprint 1–3). Não regrediu. Não atacou os 8 items do QA-CODE.md anterior.

---

## 2. Issues novos (Sprint 4)

### M1 — Duplicação do tripé `1 / X / 2` em 3 lugares

`PalpiteClient.tsx`, `JogoPickerClient.tsx` e `AdminClient.tsx` repetem o mesmo `(["1","X","2"] as const).map(...)` com botões praticamente idênticos. **Fix:** extrair `<MatchPicker value={pick} onChange={...} teamAName teamBName />` em `components/MatchPicker.tsx`. Esforço: 1 h.

### M2 — `AdminClient.tsx` 145 LoC com lista + filtro + state inline

Funciona, mas se virar 72 jogos × 9 rodadas vai pesar. **Fix:** extrair `<MatchAdminRow />` por linha. Não-urgente — render é client mas sem reflow grande.

### L1 — Inline `style={{ background: "#25D366" }}` em `ShareActions.tsx`

Tailwind já tem `bg-[#25D366]` arbitrary. Não bloqueia CSP (`'unsafe-inline'` ainda permitido) mas inconsistente com o resto do projeto. **Fix:** classe arbitrary.

### L2 — Naming inconsistente das rotas mobile

`/m/palpite` (verbo), `/m/jogo/[id]` (substantivo), `/m/share` (verbo en), `/m/perfil` (substantivo pt). Família entende, mas mistura idiomas. **Fix:** sweep final pra `/m/palpitar`, `/m/jogo`, `/m/compartilhar`, `/m/perfil` ou padronizar substantivos. Esforço: 30 min, mas requer redirects 308 das URLs antigas.

### L3 — `/m/perfil` reflete `sp.error` raw na UI

Anteriormente o Supabase poderia jogar mensagem técnica via `?error=...`. **Status:** fixo nesta passada (`?error=nao-foi-possivel-salvar` constante).

### L4 — Per-route metadata cobre só desktop static

`/m/login`, `/m/palpite`, `/m/perfil`, `/m/share`, `/m/jogo/[id]`, `/admin` herdam o título default. Ranking/Grupos/Tabela/Regulamento tem título único. **Fix:** adicionar `metadata: { title }` nas 6 telas mobile. Esforço: 15 min.

### L5 — `AdminClient.tsx` usa `alert(...)` no error path

UX baixa. **Fix:** banner pt-BR no topo do AdminClient + estado de erro. Esforço: 30 min.

### L6 — `/m/jogo/[id]` faz validação `matchId 1..72` no page.tsx E em actions.ts

Defesa em profundidade, mas duplica. **Fix:** centralizar em `lib/validators.ts`. Cosmético.

---

## 3. Acessibilidade Sprint 4

| Item | Status |
|---|---|
| Forms `/m/perfil` têm `<label>` associada | ✅ |
| `/m/login` form aceita Enter | ✅ (submit nativo) |
| `/admin` filtro tabs com `aria-pressed` | ❌ ausente |
| Botões `pick` com `aria-pressed={isSel}` | ❌ ausente em palpite/jogo/admin |
| Focus visible (`focus-visible:ring-*`) | ❌ herdado do tema, ausente nos novos botões |
| Avatar `aria-label` | ✅ |
| Flag `aria-hidden` | ✅ |

**Top fix:** adicionar `aria-pressed` nos botões 1/X/2 e `focus-visible:ring-2 focus-visible:ring-ink` global em botões.

---

## 4. SEO Sprint 4

- `sitemap.ts` ✅ 6 URLs públicas
- `robots.ts` ✅ disallow `/m/* /auth /admin /dev`
- `manifest.ts` ✅ standalone, theme, lang pt-BR, icon any+maskable
- `app/layout.tsx` metadata ✅ OpenGraph + Twitter cards + metadataBase
- Per-route metadata ⚠️ parcial (4/13 rotas)

**Fix:** `metadata: { title }` em mais 6 telas.

---

## 5. Bundle Sprint 4 delta

| Rota | Antes (Sprint 3) | Agora |
|---|---|---|
| /m/palpite | 4.75 kB | 5.15 kB |
| /m/jogo/[id] | — | 1.01 kB |
| /m/perfil | — | 150 B |
| /m/share | — | 1.30 kB |
| /admin | — | 4.96 kB (estim. via build log) |
| shared | 102 kB | 102 kB |
| middleware | 89 kB | 89.2 kB |

Adições enxutas. Nada explode.

---

## 6. Top 8 ações (re-priorizado)

| # | Sev | Item | Esforço |
|---|---|---|---|
| 1 | MED | Extrair `MatchPicker` (dedupe palpite/jogo/admin) | 1 h |
| 2 | MED | `aria-pressed` + `focus-visible:ring-2` global | 1 h |
| 3 | LOW | Per-route metadata pras 6 rotas /m/* + /admin | 15 min |
| 4 | LOW | Trocar `alert` por banner no AdminClient | 30 min |
| 5 | LOW | Tailwind arbitrary value em `ShareActions` ao invés de inline style | 10 min |
| 6 | LOW | Padronizar naming de rotas mobile | 30 min + redirects |
| 7 | LOW | Centralizar validators em `lib/validators.ts` | 30 min |
| 8 | LOW | Migrar /grupos /tabela /regulamento pra Supabase (carryover Sprint 3) | 3 h |

**Total Sprint 5:** ~7 h em polish; nenhum bloqueador.

---

## 7. Conclusão

Sprint 4 mantém qualidade. Nenhum smell crítico. RLS double-guard adicionado em `setMatchResult` (defesa em profundidade após relatório de segurança).

Pronto pra família começar a usar.
