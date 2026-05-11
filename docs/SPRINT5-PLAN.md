# Sprint 5 — Plano: Navegação · Deadline único · Filhos sub-profiles

Data: 2026-05-11 · Pendência crítica antes de família entrar pra valer.

---

## 1. Mudança A — Navegação entre telas

### Problema
Hoje cada tela tem header próprio sem nav consistente. Botões "voltar" só em algumas. Usuário se perde entre /, /grupos, /m/palpite, /admin.

### Solução
Componente `<NavBar />` em layout raiz com dois modos responsivos:

**Mobile (≤768px) — bottom tab bar fixo:**
```
[ Capa ]  [ Cartela ]  [ Ranking ]  [ Perfil ]
```
4 ícones + label. Item ativo em verde. Sempre visível enquanto autenticado.

**Desktop (>768px) — top bar fino sob TriRule:**
```
O Bolão     Capa · Grupos · Tabela · Ranking · Regulamento     Cartela | Sair
```
Linha mono pequena, esquerda masthead reduzido, centro nav, direita auth.

**Breadcrumb** opcional em /admin, /m/jogo/[id], /m/perfil — pequeno "← Voltar pra ___" no topo de cada.

### Arquivos novos / alterados
- `components/nav/{NavBar,MobileTabs,DesktopTopNav,Breadcrumb}.tsx`
- `app/layout.tsx` — inserir NavBar
- Excluir NavBar em rotas full-bleed do boletim (capa) via segment groups `(boletim)` ou prop

### Esforço: **4–5 h**

---

## 2. Mudança B — Deadline único de palpites

### Problema
Hoje RLS bloqueia por `matches.starts_at`. Significa que cada jogo trava 30 min antes do apito — confuso. Família quer **uma data limite só**: até X, palpita tudo; depois trava geral.

### Solução

**Schema (migration 0005):**
```sql
create table public.app_config (
  id int primary key check (id = 1),
  picks_deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
insert into public.app_config (id) values (1);

alter table public.app_config enable row level security;

create policy "config: leitura publica" on public.app_config for select to anon, authenticated using (true);
create policy "config: update so host" on public.app_config for update to authenticated
  using (exists(select 1 from profiles where id = (select auth.uid()) and host));
```

**Atualizar policy de picks (0006):**
```sql
-- drop policy atual baseada em starts_at
drop policy if exists "picks: insert proprio antes do apito" on public.picks;
drop policy if exists "picks: update proprio antes do apito" on public.picks;

create policy "picks: insert antes do deadline" on public.picks for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists(select 1 from app_config where id=1 and (picks_deadline is null or picks_deadline > now()))
  );

create policy "picks: update antes do deadline" on public.picks for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    exists(select 1 from app_config where id=1 and (picks_deadline is null or picks_deadline > now()))
  );
```

**Admin UI**: `/admin` ganha card "Prazo de palpites" no topo com input `datetime-local` + botão "Salvar prazo". Mostra contagem regressiva ao vivo.

**UI usuário**: countdown banner em `/` topo, `/m/palpite` topo, `/ranking` topo:
> "Palpites abertos até **10/jun/2026 12:00 BRT** · faltam 30 dias 4h"

Quando passa a data, banner muda pra "Palpites fechados desde X · ranking valendo".

### Arquivos novos / alterados
- `supabase/migrations/0005_app_config.sql`, `0006_picks_deadline_policy.sql`
- `lib/db.ts` — `fetchAppConfig()` + `setPicksDeadline()`
- `app/admin/page.tsx` — adiciona card config
- `app/admin/actions.ts` — server action `setPicksDeadline(iso)`
- `components/Countdown.tsx` — client component contagem regressiva
- Slots em layouts pra mostrar banner

### Esforço: **3 h**

---

## 3. Mudança C — Filhos como sub-profiles

### Problema
Crianças não têm email. Pai/mãe precisa palpitar pela criança. Hoje 1 auth.user = 1 perfil = 1 cartela.

### Solução: perfil pode existir SEM auth (criança gerenciada por adulto)

**Schema (migration 0007):**
```sql
-- Remove FK que liga profiles.id → auth.users.id (kids precisam id próprio)
alter table public.profiles drop constraint profiles_id_fkey;

-- Adiciona campos
alter table public.profiles
  add column auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column parent_id uuid references profiles(id) on delete cascade,
  add column birthdate date;

-- Backfill: adultos têm auth_user_id = id
update public.profiles set auth_user_id = id where auth_user_id is null;

-- Recria trigger handle_new_user pra setar auth_user_id também
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare email_local text;
begin
  email_local := split_part(new.email, '@', 1);
  insert into public.profiles (id, auth_user_id, name, initials)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'name', email_local),
    upper(substring(coalesce(new.raw_user_meta_data->>'name', email_local) from 1 for 2))
  );
  return new;
end; $$;

-- Constraint: kid (parent_id not null) NÃO pode ter auth_user_id
alter table public.profiles add constraint kid_has_no_auth
  check ((parent_id is null) or (auth_user_id is null));
```

**RLS picks atualizada (0008):**
```sql
-- helpers
create or replace function public.is_profile_managed_by_uid(profile_id uuid) returns bool language sql stable as $$
  select exists(
    select 1 from public.profiles p
    where p.id = profile_id
      and (
        p.auth_user_id = (select auth.uid())
        or p.parent_id in (select id from public.profiles where auth_user_id = (select auth.uid()))
      )
  );
$$;

drop policy if exists "picks: insert antes do deadline" on public.picks;
create policy "picks: insert antes do deadline" on public.picks for insert to authenticated
  with check (
    public.is_profile_managed_by_uid(user_id)
    and exists(select 1 from app_config where id=1 and (picks_deadline is null or picks_deadline > now()))
  );

drop policy if exists "picks: update antes do deadline" on public.picks;
create policy "picks: update antes do deadline" on public.picks for update to authenticated
  using (public.is_profile_managed_by_uid(user_id))
  with check (
    exists(select 1 from app_config where id=1 and (picks_deadline is null or picks_deadline > now()))
  );

-- picks SELECT: dono OU manager OU agregado após deadline (mantém anti-cola)
drop policy if exists "picks: leitura tempo-aberta" on public.picks;
create policy "picks: leitura tempo-aberta" on public.picks for select to anon, authenticated using (
  public.is_profile_managed_by_uid(user_id)
  or exists(select 1 from matches m where m.id = picks.match_id and m.starts_at <= now())
  or exists(select 1 from app_config where id=1 and picks_deadline is not null and picks_deadline <= now())
);
```

**UI: gerenciar família**
- `/m/familia` (nova) — lista perfis gerenciados (você + filhos cadastrados) + botão "+ Adicionar filho"
- `/m/familia/novo` — form: nome, iniciais, emoji, data nascimento (opcional)
- `app/m/familia/actions.ts` — `addKid(formData)` + `removeKid(kidId)`

**UI: trocar perfil ativo no palpite**
- `/m/palpite` topo: pill seletor "Palpitando como: [seu nome ▼]" → dropdown com você + filhos
- Estado salvo em cookie `bolao-active-profile` (server-readable)
- Server action `savePick` lê cookie pra saber `user_id` real (com check `is_profile_managed_by_uid`)

**Ranking** mostra todos os perfis (adultos + kids). Ícone 🧒 ao lado do nome de criança opcional.

**Cleanup ao deletar pai:** ON DELETE CASCADE em parent_id e auth_user_id já remove filhos automaticamente.

### Arquivos novos / alterados
- `supabase/migrations/0007_kids_schema.sql`, `0008_kids_rls.sql`
- `app/m/familia/{page,actions}.{ts,tsx}`
- `app/m/familia/novo/page.tsx`
- `app/m/palpite/PalpiteClient.tsx` — adiciona profile selector + cookie sync
- `lib/db.ts` — `fetchManagedProfiles()`, `addKid()`, `setActiveProfile()`
- `lib/active-profile.ts` — leitura/escrita do cookie
- `components/ProfileBadge.tsx` — visual de criança

### Esforço: **6–8 h**

---

## 4. Sequência de execução recomendada

1. **PR1 — Migrations B+C (1 h)**: rodar 0005-0008 em ordem; testar via API (sem código novo)
2. **PR2 — Deadline B parte 1 (1 h)**: lib/db helpers + admin card UI
3. **PR3 — Deadline B parte 2 (1 h)**: countdown component + banners
4. **PR4 — Kids C parte 1 (3 h)**: schema já no DB; /m/familia + addKid
5. **PR5 — Kids C parte 2 (3 h)**: profile selector no palpite + cookie ativo + servern action ajustada
6. **PR6 — Nav A (4 h)**: NavBar mobile bottom + desktop top
7. **PR7 — polimento + tests (2 h)**: E2E spec cobrindo deadline + kid flow

**Total: ~15 h** distribuídas em 7 PRs pequenos.

---

## 5. Riscos / decisões abertas

| Risco | Mitigação |
|---|---|
| Drop FK profiles.id → auth.users.id pode quebrar trigger handle_new_user | Recriar trigger; testar com user novo |
| Kid sem auth pode confundir nas views existentes | Adicionar coluna virtual `is_kid` na view ranking |
| Cookie de "perfil ativo" expira/perde — UX | Persistir em localStorage também; fallback pro próprio perfil |
| Deadline NULL vs valor real | NULL = sem prazo (palpitar a vontade). Documentar. |
| Conflito com policy anti-cola atual (RLS por match.starts_at) | Substituir 100% pela versão deadline. Anti-cola pré-deadline continua via match.starts_at em SELECT (ou só deadline?) — decisão: **mantemos starts_at para SELECT anti-cola por jogo**, deadline só bloqueia INSERT/UPDATE. Família vê palpites de outros após cada jogo apitar, mesmo antes do deadline geral. |

---

## 6. Sequência de aprovação

1. Você aprova este plano (5 min leitura).
2. Eu executo PR1–PR7 em sequência, ~15 h de trabalho real, dividido conforme você puder revisar.
3. Cada PR tem deploy preview + smoke test antes de merge.

OK pra começar?
