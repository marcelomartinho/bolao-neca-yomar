# QA-SECURITY-FULL — Bolão Neca & Yomar
**Data:** 2026-05-11  
**Escopo:** Sprint 4 — /admin, /m/jogo/[id], /m/perfil, /m/share + infraestrutura existente  
**Revisor:** Security Agent (claude-sonnet-4-6)

---

## 1. /admin — Superfície WRITE privilegiada

### 1.1 Verificação de host no servidor antes de mostrar UI

**Status: PASS**

`app/admin/page.tsx` executa `supabase.auth.getUser()` via `createSupabaseServerClient` (cookie-based, server-side) e em seguida consulta `profiles.host`. Se `!profile?.host`, renderiza tela de acesso negado sem jamais montar `AdminClient`. A verificação ocorre no RSC antes de qualquer dado sensível ser enviado ao cliente.

### 1.2 setMatchResult valida usuário + RLS como dobra-verificação

**Status: PASS com ressalva — veja item crítico abaixo**

`app/admin/actions.ts` (`"use server"`):
- Valida `matchId` como inteiro no intervalo [1, 72].
- Valida `result` contra allowlist `["1","X","2"]` ou `null`.
- Chama `supabase.auth.getUser()` — se sem sessão, retorna erro.
- O UPDATE no Supabase passa pela policy RLS `"matches: update apenas host"` que exige `profiles.host = true` para o `auth.uid()` ativo.

**Ressalva — MEDIUM: ausência de verificação explícita de `host` na Server Action**

A Server Action verifica autenticação (sessão existe?) mas não verifica explicitamente `host=true` antes de tentar o UPDATE. Depende 100% do RLS para bloquear usuários comuns. O RLS está correto e bloqueará a tentativa, mas a action retornará o erro bruto do Postgres (`error.message`) ao invocador. Isso pode vazar detalhes internos de schema se o Supabase alterar a mensagem de erro da policy.

**Recomendação:** adicionar guard explícito na action:

```ts
const { data: profile } = await supabase
  .from("profiles").select("host").eq("id", user.id).maybeSingle();
if (!profile?.host) return { ok: false, error: "Sem permissão" };
```

### 1.3 Usuário comum pode chamar setMatchResult via fetch direto?

**Status: MEDIUM**

Next.js Server Actions são expostas como endpoints HTTP POST em `/_next/action`. Qualquer utilizador autenticado pode invocar `setMatchResult` diretamente via `fetch` sem passar pela UI de `/admin`. O RLS bloqueará o UPDATE no banco, mas a action **não tem rate-limiting** — um usuário autenticado pode gerar spam de chamadas. Sem CSRF token explícito, mas Next.js Server Actions incluem proteção CSRF por origin-check nativa (verifica `Origin` vs `Host`), o que mitiga CSRF externo.

**Impacto:** Sem rate-limit, um atacante autenticado pode fazer flood de requests à action (DoS leve / logs poluídos). O dado em si não é comprometido pelo RLS.

**Recomendação:** adicionar rate-limit por `user.id` via middleware ou Vercel Edge Config; alternativamente, tratar no Supabase com função `pg_sleep` ou simplesmente aceitar o risco dado o contexto familiar do bolão.

---

## 2. /m/perfil — updateProfile XSS via name

### 2.1 Sanitização de inputs

**Status: PASS**

`app/m/perfil/actions.ts`:
- `name`: `String(...).trim().slice(0, 40)` — truncado a 40 chars.
- `initials`: `trim().slice(0, 2).toUpperCase()` — máximo 2 chars.
- `emoji`: `trim().slice(0, 4)` — máximo 4 chars (cobre emoji multibyte de 1-2 code points).

### 2.2 XSS via `name` em outras telas

**Status: PASS**

O campo `name` é renderizado via JSX em todas as telas onde aparece (ranking, share, perfil, boletim de participante). React escapa automaticamente strings inseridas em `{...}`. Não há uso de `dangerouslySetInnerHTML` com dados de `profiles.name`. Não há risco de XSS stored a partir deste campo.

### 2.3 Exibição de `sp.error` na tela de perfil

**Status: LOW**

`app/m/perfil/page.tsx` linha 111 renderiza `{sp.error}` diretamente como JSX text node. React escapa isso, então não é XSS. Porém, a mensagem de erro vem de `encodeURIComponent(error.message)` onde `error.message` é a string bruta do Supabase/Postgres. Isso pode vazar detalhes de constraint/schema para o usuário. Considere mapear erros de DB para mensagens amigáveis.

---

## 3. /m/share — navigator.share e clipboard

**Status: PASS**

`ShareActions.tsx`:
- `shareUrl` e `shareText` são passados como props hardcoded pelo RSC (`page.tsx`): URL estática `https://bolao-neca-yomar.vercel.app`, texto estático. Nenhuma interpolação de dado de usuário na URL do `wa.me`.
- `waUrl` é construído via `encodeURIComponent(text)` — encoding correto.
- `navigator.clipboard.writeText(shareUrl)` copia apenas a URL estática.
- `navigator.share` utiliza os campos hardcoded.
- Nenhum dado de usuário contamina os parâmetros de share.

---

## 4. ShareActions.tsx — link wa.me

**Status: PASS**

O link `https://wa.me/?text=${encodeURIComponent(text)}` é gerado com string template onde `text = shareText + shareUrl`, ambos hardcoded no RSC. Não há open-redirect nem injection. O `target="_blank"` tem `rel="noopener noreferrer"` corretamente configurado.

---

## 5. CSP — `'unsafe-inline'` em script-src e style-src

### 5.1 style-src 'unsafe-inline'

**Status: ACCEPTED / Justificado**

`'unsafe-inline'` em `style-src` é necessário porque:
- Tailwind em produção pode gerar `style` attributes via `style={{ ... }}` em componentes React (inline styles para cores dinâmicas de flags, botões de resultado, etc.).
- Next.js injeta estilos críticos inline no `<head>` durante SSR.

Sem `'unsafe-inline'`, a UI quebraria. **Alternativa parcial:** usar CSS custom properties para os valores dinâmicos e remover inline styles — viável mas requer refactor de vários componentes.

### 5.2 script-src 'unsafe-inline'

**Status: MEDIUM — deve ser avaliado para remoção**

`'unsafe-inline'` em `script-src` é mais preocupante. Next.js 15 com App Router injeta scripts inline de hidratação. Em produção com `next build`, o framework exige `'unsafe-inline'` ou `nonce` para esses scripts.

**Opção recomendada: nonce-based CSP**

Next.js 15 suporta `nonce` via middleware:

```ts
// middleware.ts
const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
const csp = `script-src 'self' 'nonce-${nonce}'; ...`;
response.headers.set("Content-Security-Policy", csp);
response.headers.set("x-nonce", nonce);
```

```tsx
// app/layout.tsx
const nonce = headers().get("x-nonce") ?? "";
<Script nonce={nonce} ... />
```

Isso elimina `'unsafe-inline'` de `script-src` mantendo hidratação funcional. Custo: ~1 sprint de refactor.

**Por ora:** o risco é mitigado pela ausência de `XSS` (sem `dangerouslySetInnerHTML` com user data, sem eval, sem JSONP). `'unsafe-inline'` em `script-src` sem `nonce` é uma fraqueza de profundidade mas não um vetor ativo dado o contexto atual.

---

## 6. SERVICE_ROLE em client/RSC público

**Status: PASS**

Grep completo em `**/*.{ts,tsx,js}` para `SERVICE_ROLE` e `service_role`: **zero matches**.

`lib/supabase/server.ts` e `lib/supabase/middleware.ts` usam exclusivamente `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Nenhum arquivo importa ou referencia a chave de serviço. Correto.

---

## 7. Open-redirect /auth/callback — allowlist pós-Sprint-4

**Status: MEDIUM — allowlist incompleta**

`app/auth/callback/route.ts` define:

```ts
const ALLOWED_PATHS = new Set(["/", "/m/palpite", "/ranking", "/grupos", "/tabela", "/regulamento"]);
```

**Rotas adicionadas no Sprint 4 ausentes da allowlist:**

| Rota | Presente na allowlist? |
|------|----------------------|
| `/m/perfil` | **NÃO** |
| `/m/jogo/[id]` (ex: `/m/jogo/1`) | **NÃO** |
| `/m/share` | **NÃO** |
| `/admin` | **NÃO** |

A função `safePath` verifica o path base sem query/hash, portanto `/m/jogo/5` nunca bate em nenhuma entrada da allowlist e cai no fallback `/m/palpite`.

**Impacto:** Não é uma vulnerabilidade de open-redirect (o guard está correto e o fallback é seguro). Porém, qualquer link de login com `next=/m/perfil` ou `next=/admin` vai silenciosamente redirecionar para `/m/palpite` em vez do destino pretendido, degradando a UX.

**Fix:** expandir `ALLOWED_PATHS`:

```ts
const ALLOWED_PATHS = new Set([
  "/", "/m/palpite", "/m/perfil", "/m/share", "/m/jogo",
  "/ranking", "/grupos", "/tabela", "/regulamento", "/admin",
]);
```

E ajustar `safePath` para suportar prefixos para `/m/jogo/[id]`:

```ts
const DYNAMIC_PREFIXES = ["/m/jogo/"];
const path = raw.split(/[?#]/)[0];
if (ALLOWED_PATHS.has(path)) return raw;
if (DYNAMIC_PREFIXES.some((p) => path.startsWith(p))) return raw;
return fallback;
```

---

## 8. PWA manifest

**Status: PASS com observação**

`app/manifest.ts`:
- `start_url: "/"` — correto, rota pública.
- `display: "standalone"` — adequado para PWA mobile.
- Sem `scope` definido — quando omitido, o browser assume o diretório do manifest (`/`), o que cobre toda a app. Aceitável.
- Sem `share_target` — correto, a app não deve receber shares de outras apps (apenas emite).
- `icons` usa SVG com `purpose: "maskable"` — SVGs como maskable não são ideais (requerem área de segurança visual), mas não é problema de segurança.

---

## 9. robots.ts

**Status: PASS**

```
disallow: ["/m/", "/auth/", "/admin", "/dev/"]
```

- `/m/` cobre todas as rotas autenticadas incluindo `/m/perfil`, `/m/share`, `/m/jogo/`.
- `/auth/` bloqueia o callback OAuth.
- `/admin` bloqueia a rota administrativa.
- `/dev/` bloqueia componentes de desenvolvimento.

Correto e completo para o Sprint 4.

---

## 10. Sitemap — apenas rotas públicas

**Status: PASS com observação menor**

`app/sitemap.ts` inclui: `/`, `/grupos`, `/tabela`, `/regulamento`, `/ranking`, `/m/login`.

Nenhuma rota autenticada (`/m/palpite`, `/m/perfil`, `/m/share`, `/m/jogo/*`, `/admin`) está incluída.

**Observação:** `/m/login` está no sitemap. É uma rota pública por natureza (página de login), porém crawlers podem indexá-la. Não é um problema de segurança — é uma prática aceitável.

---

## 11. Top 5 Issues por Severidade

| # | Severidade | Issue | Fix em 1 linha |
|---|-----------|-------|----------------|
| 1 | **MEDIUM** | `setMatchResult` não verifica `host=true` explicitamente antes do UPDATE — vaza mensagem bruta de erro RLS ao invocador não-autorizado | Adicionar `select host from profiles` guard antes do `supabase.from("matches").update(...)` |
| 2 | **MEDIUM** | Allowlist de `/auth/callback` não inclui `/m/perfil`, `/m/jogo`, `/m/share`, `/admin` — redirects pós-login silenciosamente caem em fallback | Expandir `ALLOWED_PATHS` + suportar prefixo `/m/jogo/` com `startsWith` |
| 3 | **MEDIUM** | `script-src 'unsafe-inline'` no CSP sem nonce — qualquer XSS futuro pode injetar scripts arbitrários | Implementar nonce via middleware do Next.js 15 |
| 4 | **LOW** | `sp.error` em `/m/perfil` exibe mensagem bruta do Postgres ao usuário | Mapear `error.message` para string genérica antes de `encodeURIComponent` |
| 5 | **LOW** | Sem rate-limiting nas Server Actions — flood de `setMatchResult` ou `updateProfile` possível por usuário autenticado | Adicionar rate-limit por `user.id` no middleware ou Vercel Edge Config |

---

## Checklist Final

| Item | Status |
|------|--------|
| SERVICE_ROLE ausente em client/RSC | PASS |
| host check no RSC de /admin | PASS |
| RLS dobra-verificação em matches UPDATE | PASS |
| Inputs de perfil sanitizados (length) | PASS |
| XSS stored via name/initials/emoji | PASS |
| dangerouslySetInnerHTML com user data | PASS (regulamento usa data estática) |
| wa.me link injection | PASS |
| navigator.share injection | PASS |
| Open-redirect guard funcional | PASS |
| Open-redirect allowlist completa | FAIL (Sprint 4 rotas ausentes) |
| CSP style-src unsafe-inline | ACCEPTED |
| CSP script-src unsafe-inline | MEDIUM |
| No CSRF externo (Next.js origin-check) | PASS |
| robots.ts cobre novas rotas | PASS |
| Sitemap sem rotas autenticadas | PASS |
| PWA sem share_target desnecessário | PASS |
| Sem segredos hardcoded no código | PASS |
