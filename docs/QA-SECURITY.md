# QA-SECURITY — Bolão Neca & Yomar

**Data:** 2026-05-11
**Revisor:** Security Audit (Claude Sonnet 4.6)
**App:** https://bolao-neca-yomar.vercel.app (Next.js 15 + Supabase)

---

## 1. Server Actions / Route Handlers

### `app/m/palpite/actions.ts` — `savePick`

| Verificação | Status | Detalhe |
|---|---|---|
| Auth antes de ação | PASS | `supabase.auth.getUser()` chamado antes do upsert; retorna erro se sem sessão |
| Input validation `pick` | PASS | Allowlist `["1","X","2"].includes(pick)` antes de qualquer IO |
| Input validation `matchId` | PARTIAL | Tipado como `number` no TypeScript, mas sem validação de runtime (ex: `Number.isInteger`) |
| SQL Injection | PASS | Supabase SDK usa queries parametrizadas internamente |
| user_id forjado | PASS | `user_id` vem de `user.id` (sessão servidor), não do payload do cliente |
| CSRF | PASS | Server Actions Next.js 15 validam `Origin` header automaticamente |
| Open redirect | N/A | Sem redirect nessa action |

**Achado:** `matchId` chega como `number` via TypeScript mas não há guard de runtime. Um cliente malicioso que bypass a camada TS poderia enviar `NaN`, `Infinity` ou string. A RLS bloqueia upserts inválidos no banco, mas retornaria erro 400 em vez de 422 validado.

**Fix:** Adicionar `if (!Number.isInteger(matchId) || matchId <= 0) return { ok: false, error: "matchId inválido" };`

---

### `app/m/login/actions.ts` — `signInWithMagicLink`

| Verificação | Status | Detalhe |
|---|---|---|
| Auth check | N/A | Endpoint público por definição |
| Email validation | PARTIAL | `String(formData.get("email") ?? "").trim()` — verifica vazio, mas não valida formato |
| Open redirect (emailRedirectTo) | MEDIUM | `origin` é lido do header `Origin`/`host` da request |
| CSRF | PASS | Server Action Next.js 15 |

**Achado (MEDIUM) — Open Redirect no emailRedirectTo:**
O `origin` é construído a partir dos headers `origin` ou `host` da requisição:
```ts
const origin = h.get("origin") || (h.get("host") ? `https://${h.get("host")}` : "http://localhost:3000");
```
Se um proxy ou atacante puder forjar o header `Host`, o magic-link enviado ao usuário apontaria para um domínio controlado pelo atacante. Na prática, o Supabase valida `emailRedirectTo` contra a allow-list configurada no dashboard (`URL Configuration > Redirect URLs`) — esse é o controle primário. Mas a defesa em código é fraca.

**Fix:** Substituir derivação dinâmica por constante de env: `const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";`

---

### `app/auth/callback/route.ts` — `GET`

| Verificação | Status | Detalhe |
|---|---|---|
| PKCE code exchange | PASS | `exchangeCodeForSession(code)` — Supabase SSR faz PKCE |
| `next` param — open redirect | HIGH | `next` vem direto da query string; `NextResponse.redirect(\`${origin}${next}\`)` sem validação |
| Auth antes de redirect | PASS | Só redireciona para `next` se `!error` |

**Achado (HIGH) — Open Redirect via `next` query param:**
```
/auth/callback?code=valid_code&next=//evil.com/phishing
```
`origin` é o próprio domínio, mas `${origin}${next}` com `next=//evil.com` resulta em `https://bolao-neca-yomar.vercel.app//evil.com` — navegadores modernos normalizam isso para `https://evil.com`. Qualquer link de magic-link pode ser manipulado se o atacante controlar o `next` inserido no link original.

**Fix:**
```ts
const safePaths = ["/m/palpite", "/ranking", "/"];
const next = searchParams.get("next") ?? "/m/palpite";
const safePath = safePaths.includes(next) ? next : "/m/palpite";
return NextResponse.redirect(`${origin}${safePath}`);
```

---

### `app/m/logout/route.ts` — `POST`

| Verificação | Status | Detalhe |
|---|---|---|
| Método HTTP | PASS | POST — não acionável via GET/link |
| Redirect | PASS | Hardcoded para `/m/login` |
| CSRF | PASS | Requer POST com cookies válidos |

**Status: sem issues.**

---

## 2. SERVICE_ROLE — Exposição em Código

**Resultado: PASS.**

Grep em todos os `.ts`/`.tsx` do projeto por `SERVICE_ROLE`, `service_role`:
- Nenhuma importação ou referência em código de aplicação (server components, client components, actions, route handlers, lib/).
- A chave `SUPABASE_SERVICE_ROLE_KEY` está presente em `.env.local` (gitignored) e deve estar apenas nas env vars do Vercel (server-side only, sem prefixo `NEXT_PUBLIC_`).
- `lib/supabase/server.ts` e `lib/supabase/middleware.ts` usam exclusivamente `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Acao recomendada:** Confirmar no dashboard Vercel que `SUPABASE_SERVICE_ROLE_KEY` NÃO está exposta como variável de ambiente disponível para o browser (não deve ter prefixo `NEXT_PUBLIC_`).

---

## 3. RLS Coverage

| Tabela | RLS Habilitado | Policies |
|---|---|---|
| `teams` | PASS | SELECT: anon + authenticated (público) |
| `groups` | PASS | SELECT: anon + authenticated (público) |
| `matches` | PASS | SELECT: público; UPDATE: apenas `profiles.host = true` |
| `profiles` | PASS | SELECT: público; UPDATE: dono; INSERT: próprio |
| `picks` | PASS | INSERT: dono + jogo aberto; UPDATE: dono + jogo aberto; SELECT: anti-cola; DELETE: bloqueado |

**Análise por policy:**

**matches: update apenas host** — Usa `EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND host = true)`. Correto. O campo `host` em `profiles` é controlado via migration/seed e não tem policy de UPDATE que permita auto-promoção. PASS.

**profiles: insert apenas próprio** — `with check (id = (select auth.uid()))`. Impede inserção de perfis alheios via API. O trigger de auto-create usa `SECURITY DEFINER` e contorna RLS legitimamente. PASS.

**picks: insert/update com jogo aberto** — `starts_at > now()` no EXISTS garante o travamento temporal. PASS.

**picks: DELETE** — Sem policy = bloqueio total. Intencional e correto. PASS.

**Brecha ausente:** Nenhuma tabela sem RLS encontrada. Sem `INSERT` desprotegido em `teams`, `groups`, `matches` para roles autenticados — ausência de policy INSERT = bloqueio por padrão no Supabase (quando RLS está habilitado).

---

## 4. Magic Link Redirect — Validação da allow-list

O Supabase controla `emailRedirectTo` contra `URL Configuration > Redirect URLs` no dashboard. Esse é o controle correto e suficiente no nível do provedor.

**Checklist:**
- [ ] Confirmar que o dashboard Supabase tem apenas `https://bolao-neca-yomar.vercel.app/**` na allow-list de redirect URLs (sem wildcards `*` soltos ou `http://`).
- [ ] Remover `http://localhost:3000` da allow-list em produção (ou manter separado por ambiente).
- [ ] Aplicar o fix do `NEXT_PUBLIC_SITE_URL` em `signInWithMagicLink` para hardcodar o origin em vez de ler do header (ver seção 1).

---

## 5. Validação de Input em `savePick`

| Campo | Validação atual | Suficiente? |
|---|---|---|
| `pick` | `["1","X","2"].includes(pick)` — allowlist rigorosa | PASS |
| `matchId` | Tipo TypeScript `number` apenas | PARTIAL — sem runtime guard |

O TypeScript garante o tipo em tempo de compilação, mas Server Actions recebem dados serializados de JSON. Um payload manipulado pode enviar `matchId: "1 OR 1=1"` que TypeScript não rejeita em runtime. O Supabase SDK parametriza a query então não há SQL injection, mas o `upsert` com `match_id` inválido retorna erro do banco em vez de ser rejeitado na camada de aplicação.

**Fix em uma linha:** `if (!Number.isInteger(matchId) || matchId <= 0) return { ok: false, error: "matchId inválido" };`

---

## 6. HTTP Security Headers

### Headers presentes (via Next.js 15 defaults + `poweredByHeader: false`)

| Header | Status | Fonte |
|---|---|---|
| `X-Content-Type-Options: nosniff` | PASS | Next.js default |
| `X-DNS-Prefetch-Control: on` | PASS | Next.js default |
| `Strict-Transport-Security` | PASS | Vercel injeta em produção |
| `X-Powered-By: Next.js` | PASS removido | `poweredByHeader: false` em `next.config.ts` |
| `X-Frame-Options` | AUSENTE | Next.js 15 não injeta por default |
| `Content-Security-Policy` | AUSENTE | Nenhuma configuração encontrada |
| `Referrer-Policy` | AUSENTE | Next.js não injeta por default |
| `Permissions-Policy` | AUSENTE | Next.js não injeta por default |

**Achado (MEDIUM) — X-Frame-Options ausente:** A aplicação pode ser embutida em iframes por terceiros, permitindo clickjacking.

**Achado (MEDIUM) — CSP ausente:** Sem Content-Security-Policy, qualquer XSS injetado pode carregar scripts externos.

**Fix:** Adicionar em `next.config.ts`:
```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;" },
    ],
  }];
},
```
Nota: `unsafe-inline` é necessário inicialmente pelo Tailwind/Next.js — evoluir para nonces em sprint dedicada de hardening.

---

## 7. Secrets no Histórico Git

**Verificação executada:** `git log -p --all -S "service_role"` + filtragem por linhas com `eyJ`.

**Resultado: PASS (com ressalva).**

O histórico contém referências a `SUPABASE_SERVICE_ROLE_KEY=eyJ...` apenas em arquivos de documentação (`docs/SUPABASE_SETUP.md`) com valores truncados (`eyJ...` — placeholder, não o JWT completo).

O `.env.local` contém os tokens reais mas está corretamente listado em `.gitignore` (regra `.env*.local`) e nunca foi comitado.

**Ressalva importante:** Os tokens reais foram trafegados em mensagens desta sessão de chat. Embora não estejam no repositório git, recomenda-se rotacioná-los como precaução:
1. Supabase Dashboard > Project Settings > API > "Reset" na service role key.
2. Atualizar `.env.local` e as env vars do Vercel após rotação.

---

## 8. Anti-cola RLS — Análise e Recomendação

**Policy atual:**
```sql
-- Caso A: próprio pick (sempre visível)
user_id = (select auth.uid())
OR
-- Caso B: pick alheio, jogo já iniciado
exists (select 1 from matches where id = picks.match_id and starts_at < now())
```

**O que essa policy permite hoje:**
- Antes do apito: usuário vê apenas seus próprios picks. Picks alheios são invisíveis. Cola impossível.
- Após o apito: todos os picks do jogo ficam visíveis para qualquer participante autenticado (incluindo valores individuais de outros usuários).

**Pergunta de design:** Quer manter a visibilidade individual de picks alheios pós-apito, ou prefere expor apenas dados agregados (ranking com pontuação, sem revelar "Fulano apostou 1 nesse jogo")?

**Recomendação:** Para um bolão de apostas com premiação em dinheiro, expor picks individuais pós-jogo é aceitável (não causa dano financeiro pois o prazo já fechou). A tela de ranking e perfil individual (`/[participante]`) dependem dessa visibilidade para funcionar. Manter como está é a escolha correta.

**Se quiser restringir para apenas agregados:** Remover o Caso B da policy e criar uma função `SECURITY DEFINER` que retorna apenas contagens/pontuações, sem picks raw. Isso adicionaria complexidade sem benefício real para o modelo de negócio do bolão.

**Conclusão: manter policy atual. Sem brecha.**

---

## 9. dangerouslySetInnerHTML — `app/regulamento/page.tsx`

`txt` em `dangerouslySetInnerHTML={{ __html: txt }}` vem do array estático `REGRAS` definido no próprio arquivo (`app/regulamento/page.tsx`, linha 6). Não há input de usuário, banco de dados ou API externa envolvido. O conteúdo é hardcoded em build time.

**Status: FALSE POSITIVE — sem risco.**

Se futuramente o conteúdo de `REGRAS` vier de um CMS, banco ou API, aplicar `DOMPurify.sanitize(txt)` antes do render.

---

## 10. Top 5 Issues por Severidade

| # | Severidade | Issue | Fix em 1 linha |
|---|---|---|---|
| 1 | HIGH | Open redirect em `/auth/callback?next=//evil.com` | Validar `next` contra allowlist `["/m/palpite", "/ranking", "/"]` antes de redirecionar |
| 2 | MEDIUM | `emailRedirectTo` construído a partir do header `Host` (forjável) | Substituir por `process.env.NEXT_PUBLIC_SITE_URL` hardcoded |
| 3 | MEDIUM | X-Frame-Options e CSP ausentes | Adicionar `headers()` em `next.config.ts` com `X-Frame-Options: DENY` e CSP básico |
| 4 | LOW | `matchId` sem validação de runtime em `savePick` | Adicionar `if (!Number.isInteger(matchId) || matchId <= 0) return { ok: false, error: "matchId inválido" }` |
| 5 | INFO | Tokens reais trafegaram fora do repositório (chat) | Rotacionar `SUPABASE_SERVICE_ROLE_KEY` no dashboard Supabase e atualizar Vercel |

---

## Resumo Executivo

| Area | Status |
|---|---|
| Server actions — auth check | PASS |
| Server actions — input validation | PARTIAL (matchId) |
| SERVICE_ROLE em código client/RSC | PASS — nenhuma ocorrência |
| RLS coverage (todas as tabelas) | PASS |
| Magic link + allow-list Supabase | PASS (verificar dashboard) |
| Open redirect callback | FAIL — HIGH |
| HTTP security headers | PARTIAL — faltam X-Frame-Options, CSP |
| Secrets em git history | PASS — .env.local nunca comitado |
| Anti-cola RLS | PASS — policy correta, manter |
| dangerouslySetInnerHTML | FALSE POSITIVE — fonte estática |
