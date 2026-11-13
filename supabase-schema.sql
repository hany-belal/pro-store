-- PRO STORE: Supabase schema and Row Level Security
-- Run this whole file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  category text not null default 'إكسسوارات' check (category in ('سماعات','ساعات','شواحن وكابلات','إكسسوارات')),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_active_created_idx on public.products(active, created_at desc);

alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- SECURITY DEFINER prevents recursive profile-policy evaluation. Only reads caller's own role.
create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;
revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()));

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products
for select to anon, authenticated using (active = true or public.is_store_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
for insert to authenticated with check (public.is_store_admin());
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
for delete to authenticated using (public.is_store_admin());

-- Required table privileges; RLS policies above still enforce row-level access.
grant select on public.profiles to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- CREATE ADMIN (after running the schema):
-- 1) Supabase Dashboard > Authentication > Users > Add user: create your admin account.
-- 2) Copy that user's UUID and run the next two lines after replacing the placeholder:
-- insert into public.profiles (id, role) values ('PASTE_AUTH_USER_UUID_HERE', 'admin')
-- on conflict (id) do update set role = 'admin';
-- Do not add public policies that allow users to insert/update their own profile role.
-- Never put service_role keys or passwords in website files.
