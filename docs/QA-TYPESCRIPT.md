# QA — TypeScript Safety

Data: 2026-05-11 · TS 5.9.3 strict · `noImplicitAny` + `strictNullChecks` ativos · typedRoutes ligado

---

## 1. Sumário

`pnpm typecheck`: **0 erros** consistentemente após cada PR.

Search:
- `: any` em código-fonte: **0**
- `as any`: **0**
- `@ts-ignore` / `@ts-expect-error`: **0**
- `!` non-null assertion: **6** ocorrências (todas em `process.env.NEXT_PUBLIC_*!` nos clientes Supabase — aceitável; validado em build time pela Vercel via env vars)

---

## 2. Issues

### M1 — Tipos `MatchRow`/`PickRow`/`RankingRow` em `lib/db.ts` duplicam shape do `Database`

`MatchRow` foi definido manualmente; deveria derivar de `Database["public"]["Tables"]["matches"]["Row"]` para nunca dessincronizar do schema gerado.

**Fix:**
```ts
import type { Database } from "./supabase/types";
export type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
export type PickRow = Database["public"]["Tables"]["picks"]["Row"];
export type RankingRow = Database["public"]["Views"]["ranking"]["Row"];
```
Esforço: 5 min.

### M2 — `as keyof typeof TEAMS` em vários TSX

Quando lê `match.team_a` do Supabase, vem como `string` (Database genérico). Forçamos `as keyof typeof TEAMS` para indexar `TEAMS[code]`. Se schema mudar (algum código exótico aparecer), runtime quebra silenciosamente.

**Fix:** criar type guard:
```ts
function isTeamCode(s: string): s is TeamCode {
  return s in TEAMS;
}
```
Usar onde indexa. Esforço: 30 min.

### L1 — `pick: string` no Database vs `Pick = "1"|"X"|"2"` local

Generated types regridem o CHECK constraint. Já tratado com `as Pick` em alguns lugares. **Fix:** type guard `isPick(s: string): s is Pick` + usar em fronteiras (server actions, RSC fetchers).

### L2 — `Flag` recebe `colors: [string,string,string]` mas `TEAMS[code].colors` é `string[]`

Tipo do `TEAMS` no `static-data.ts` é estreito (`[string,string,string]`) — OK. Mas quando vier do Supabase (`Database` define `colors: string[]`), perde. Hoje só usa o estático. **Fix:** quando migrar /grupos /tabela pra Supabase, validar/normalizar `colors` antes de passar pro `Flag`.

### L3 — `Link href={`/${user.id}`}` cast em ranking/page.tsx

typedRoutes não conhece rotas dinâmicas user-id. Atualmente funciona porque `[participante]` é catch via dynamic segment, mas o TS pode acusar. **Status:** não acusa hoje porque `as Route` é implícito via template literal — Next infere. Manter atento se atualizar Next.

### L4 — `process.env.X!` em 3 lugares

`lib/supabase/{client,server,middleware}.ts` usam `process.env.NEXT_PUBLIC_SUPABASE_URL!`. Se rodar sem env, runtime crashes com mensagem feia.

**Fix:** central `lib/env.ts`:
```ts
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
export const SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL");
```
Esforço: 20 min.

### L5 — Date conversão repetida

Em 5+ lugares: `new Date(match.starts_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", ... })`. Refatorar:

```ts
// lib/format.ts
export function formatBRT(iso: string, opts?: Intl.DateTimeFormatOptions): string { ... }
export function formatDayBRT(iso: string): string { ... }
```
Esforço: 30 min.

### L6 — Server action return types não exportados de forma uniforme

`savePick → SavePickResult`, `setMatchResult → SetResultResult`, `updateProfile → void (redirect)`. **Fix:** padronizar `ActionResult = {ok:true}|{ok:false,error:string}` em `lib/actions.ts`.

---

## 3. Top 6 fixes

| # | Sev | Item | Esforço |
|---|---|---|---|
| 1 | M | Derivar MatchRow/PickRow/RankingRow do Database | 5 min |
| 2 | M | Type guards `isTeamCode` + `isPick` | 30 min |
| 3 | L | `lib/env.ts` centralizado | 20 min |
| 4 | L | `lib/format.ts` p/ Date BRT helpers | 30 min |
| 5 | L | `ActionResult` shared type | 15 min |
| 6 | L | `as Route` explicit em links dinâmicos | 10 min |

**Total:** ~2 h.

---

## 4. Conclusão

Type safety geral: **A−**. Strict ativo, zero bypass, derivações faltantes em 6 lugares. Sem dívida que impeça produção.
