-- 0005_app_config.sql
-- Single-row config table holding the global picks deadline.
-- Only the row with id=1 is allowed; CHECK constraint enforces.

create table if not exists public.app_config (
  id int primary key check (id = 1),
  picks_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_config (id) values (1)
on conflict (id) do nothing;

create or replace function public.app_config_touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_app_config_updated_at on public.app_config;
create trigger trg_app_config_updated_at
  before update on public.app_config
  for each row execute function public.app_config_touch_updated_at();

alter table public.app_config enable row level security;

drop policy if exists "config: leitura publica" on public.app_config;
create policy "config: leitura publica" on public.app_config
  for select to anon, authenticated using (true);

drop policy if exists "config: update so host" on public.app_config;
create policy "config: update so host" on public.app_config
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and host = true
    )
  )
  with check (id = 1);
