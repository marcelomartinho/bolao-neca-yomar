# Vercel — Setup

## 1. Conectar repo

1. https://vercel.com → **New Project** → import `bolao-neca-yomar` do GitHub
2. Framework Preset: **Next.js** (auto-detect)
3. Root directory: `./`
4. Build command: `pnpm build` (auto)

## 2. Env vars

`Settings → Environment Variables`:

| Nome                              | Preview | Production |
|-----------------------------------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | ✅      | ✅         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | ✅      | ✅         |
| `SUPABASE_SERVICE_ROLE_KEY`       | ❌      | ✅         |

## 3. Domínio

- Padrão: `bolao-neca-yomar.vercel.app` (grátis)
- Custom (opcional, R$40/ano): adicionar `bolaonecayomar.com.br` em `Settings → Domains`

## 4. Deploy

- Push `main` → deploy production automático
- PR aberto → preview deploy (URL única por branch)
- Promote: já é automático em production via `main`. Pra release manual, usar `vercel --prod` localmente.

## 5. Analytics

`Analytics → Enable` (grátis no Hobby): Web Vitals + visitas.
