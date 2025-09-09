-- Ensure required extension for UUID generation
create extension if not exists pgcrypto;

-- 1) Roles enum and membership tables
create type public.app_role as enum ('developer', 'organizer', 'admin', 'interviewer');
create type public.company_role as enum ('admin', 'interviewer');

-- 2) Helper function: update updated_at on UPDATE
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- 3) has_role function (security definer) to avoid RLS recursion issues
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 4) Company admin/member helper functions
create or replace function public.is_company_admin(_user_id uuid, _company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_memberships
    where user_id = _user_id
      and company_id = _company_id
      and role = 'admin'::public.company_role
  );
$$;

create or replace function public.is_company_member(_user_id uuid, _company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_memberships
    where user_id = _user_id
      and company_id = _company_id
  );
$$;

-- 5) Profiles table (no FK to auth.users to avoid reserved schema refs)
create table if not exists public.profiles (
  id uuid primary key,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Profiles policies
create policy "Profiles: select self or developer" on public.profiles
for select to authenticated
using (auth.uid() = id or public.has_role(auth.uid(), 'developer'));

create policy "Profiles: insert self" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

create policy "Profiles: update self or developer" on public.profiles
for update to authenticated
using (auth.uid() = id or public.has_role(auth.uid(), 'developer'))
with check (auth.uid() = id or public.has_role(auth.uid(), 'developer'));

create policy "Profiles: delete only developer" on public.profiles
for delete to authenticated
using (public.has_role(auth.uid(), 'developer'));

-- 6) User roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- User roles policies
create policy "UserRoles: select self or developer" on public.user_roles
for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'developer'));

create policy "UserRoles: manage only developer" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'developer'))
with check (public.has_role(auth.uid(), 'developer'));

-- 7) Companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  cnpj text,
  email text,
  phone text,
  address jsonb,
  logo_url text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_cnpj_unique unique (cnpj)
);

alter table public.companies enable row level security;

create trigger trg_companies_updated_at
before update on public.companies
for each row execute function public.update_updated_at_column();

-- Companies policies
create policy "Companies: select member or developer" on public.companies
for select to authenticated
using (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_member(auth.uid(), id)
);

create policy "Companies: insert self owner or developer" on public.companies
for insert to authenticated
with check (
  created_by = auth.uid() or public.has_role(auth.uid(), 'developer')
);

create policy "Companies: update admin or developer" on public.companies
for update to authenticated
using (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_admin(auth.uid(), id)
)
with check (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_admin(auth.uid(), id)
);

create policy "Companies: delete only developer" on public.companies
for delete to authenticated
using (public.has_role(auth.uid(), 'developer'));

-- 8) Company memberships table
create table if not exists public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  role public.company_role not null,
  added_by uuid,
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

alter table public.company_memberships enable row level security;

-- Membership policies
create policy "Memberships: select member or developer" on public.company_memberships
for select to authenticated
using (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_member(auth.uid(), company_id)
);

create policy "Memberships: insert admin or developer" on public.company_memberships
for insert to authenticated
with check (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_admin(auth.uid(), company_id)
);

create policy "Memberships: update admin or developer" on public.company_memberships
for update to authenticated
using (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_admin(auth.uid(), company_id)
)
with check (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_admin(auth.uid(), company_id)
);

create policy "Memberships: delete admin or developer" on public.company_memberships
for delete to authenticated
using (
  public.has_role(auth.uid(), 'developer')
  or public.is_company_admin(auth.uid(), company_id)
);

-- 9) Auto-add creator as company admin membership
create or replace function public.add_company_creator_membership()
returns trigger as $$
begin
  insert into public.company_memberships (company_id, user_id, role, added_by)
  values (new.id, new.created_by, 'admin', new.created_by)
  on conflict (company_id, user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_companies_add_creator_membership
after insert on public.companies
for each row execute function public.add_company_creator_membership();