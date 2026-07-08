create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.stock_status as enum ('In Stock', 'Out of Stock');
create type public.order_status as enum (
  'New Order',
  'Preparing',
  'Ready for Pickup',
  'Completed',
  'Cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand text not null,
  category text not null,
  pet_type text,
  description text,
  image_url text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_name text not null default 'Default',
  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) check (sale_price is null or sale_price >= 0),
  stock_status public.stock_status not null default 'In Stock',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'New Order',
  full_name text not null,
  phone text not null,
  email text not null,
  pickup_date date not null,
  pickup_time time not null,
  notes text,
  total_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace view public.wishlist_product_counts
with (security_invoker = true)
as
select
  w.product_id,
  w.variant_id,
  p.name as product_name,
  p.brand,
  p.category,
  p.pet_type,
  v.variant_name,
  v.stock_status,
  count(distinct w.user_id)::integer as wishlist_count
from public.wishlists w
join public.products p on p.id = w.product_id
join public.product_variants v on v.id = w.variant_id
group by w.product_id, w.variant_id, p.name, p.brand, p.category, p.pet_type, v.variant_name, v.stock_status;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;

create policy "Profiles are readable by owner or admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "Active products are public"
on public.products for select
using (is_active = true or public.is_admin());

create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Active product variants are public"
on public.product_variants for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  )
);

create policy "Admins manage product variants"
on public.product_variants for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users manage own cart"
on public.cart_items for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users view own orders"
on public.orders for select
using (user_id = auth.uid() or public.is_admin());

create policy "Users create own orders"
on public.orders for insert
with check (user_id = auth.uid());

create policy "Admins update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

create policy "Users cancel own pending orders"
on public.orders for update
using (user_id = auth.uid() and status in ('New Order', 'Preparing'))
with check (user_id = auth.uid() and status = 'Cancelled');

create policy "Users view own order items"
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

create policy "Users create order items for own orders"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

create policy "Users manage own wishlist"
on public.wishlists for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Wishlist counts are admin readable"
on public.wishlists for select
using (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are public"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admins upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins update product images"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());
