-- 0007_kids_schema.sql
-- Permite perfis filhos (sem auth) gerenciados por um adulto (parent_id).
-- Adultos continuam 1:1 com auth.users (mesmo id). Filhos têm id próprio e
-- auth_user_id NULL.

-- 1) Adiciona colunas
alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column if not exists parent_id uuid references public.profiles(id) on delete cascade,
  add column if not exists birthdate date;

-- 2) Backfill: adultos existentes têm auth_user_id = id (mesma uuid de auth.users)
update public.profiles set auth_user_id = id where auth_user_id is null;

-- 3) Drop FK profiles.id → auth.users.id (kids precisarão de uuid próprio)
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- 4) Garante que kid (parent_id NOT NULL) não pode ter auth_user_id
alter table public.profiles drop constraint if exists kid_has_no_auth;
alter table public.profiles add constraint kid_has_no_auth
  check (parent_id is null or auth_user_id is null);

-- 5) Atualiza trigger pra setar auth_user_id também ao criar adulto novo
create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  email_local text;
  name_raw text;
  display_name text;
  display_initials text;
begin
  email_local := split_part(new.email, '@', 1);
  name_raw := new.raw_user_meta_data->>'name';
  display_name := coalesce(nullif(trim(name_raw), ''), email_local);
  display_initials := upper(substring(
    regexp_replace(display_name, '[^A-Za-zÀ-ÿ\s]', '', 'g') from 1 for 2
  ));
  insert into public.profiles (id, auth_user_id, name, initials)
  values (new.id, new.id, display_name, display_initials)
  on conflict (id) do update set
    auth_user_id = excluded.auth_user_id;
  return new;
end $$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Índice em parent_id pra queries "meus filhos"
create index if not exists idx_profiles_parent_id on public.profiles (parent_id);
create index if not exists idx_profiles_auth_user_id on public.profiles (auth_user_id);
