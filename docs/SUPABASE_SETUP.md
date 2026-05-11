# Supabase — Setup

Reproduzível em <10 min.

## 1. Criar projeto

1. https://supabase.com/dashboard → **New project**
2. Region: `South America (São Paulo)` (latência ideal pra família no Brasil)
3. Database password: gerar e guardar em gerenciador de senhas
4. Aguardar provisionamento (~2 min)

## 2. Habilitar Auth magic-link

1. **Authentication → Providers → Email**
2. Toggle **Enable Email Provider** = on
3. Toggle **Confirm email** = on
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (dev)
   - Redirect URLs adicionar: `http://localhost:3000/auth/callback`, `https://bolao-neca-yomar.vercel.app/auth/callback`

## 3. Copiar chaves para `.env.local`

`Settings → API`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # "anon public"
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # "service_role" — NUNCA expor ao browser
```

## 4. Aplicar migrations

Opção A — Supabase CLI (recomendado):

```bash
pnpm dlx supabase link --project-ref <ref>
pnpm dlx supabase db push
```

Opção B — manual: SQL Editor → cole `supabase/migrations/0001_schema.sql`, depois `0002_rls.sql`, depois `0003_seed.sql`.

## 5. Regenerar types TS

```bash
pnpm dlx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
```

## 6. Configurar Vercel

`Vercel Project → Settings → Environment Variables`:

| Nome                              | Preview | Production |
|-----------------------------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | ✅      | ✅         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | ✅      | ✅         |
| `SUPABASE_SERVICE_ROLE_KEY`       | ❌      | ✅         |

Service role **nunca** vai pra preview.
