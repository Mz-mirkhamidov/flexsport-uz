-- Flexsport.uz — Faza 1 initial schema

create extension if not exists pgcrypto;

-- ============================================================
-- profiles (1:1 with auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  email text,
  telegram_chat_id bigint,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- addresses / delivery zones
-- ============================================================
create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  method text not null check (method in ('tashkent_courier','region_post')),
  fee numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  region text not null,
  city text not null,
  address_line text not null,
  delivery_zone_id uuid references public.delivery_zones(id),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses(user_id);

-- ============================================================
-- catalog
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index categories_parent_idx on public.categories(parent_id);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid not null references public.categories(id),
  brand_id uuid references public.brands(id),
  base_price numeric(12,2) not null check (base_price >= 0),
  discount_pct numeric(5,2) check (discount_pct between 0 and 100),
  tags text[] not null default '{}',
  is_active boolean not null default true,
  low_stock_threshold int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_brand_idx on public.products(brand_id);
create index products_tags_idx on public.products using gin(tags);
create index products_active_created_idx on public.products(is_active, created_at desc);
create function public.immutable_array_to_string(arr text[], sep text)
returns text
language sql
immutable
as $$ select array_to_string(arr, sep) $$;

create index products_fts_idx on public.products using gin(
  to_tsvector('simple'::regconfig, name || ' ' || coalesce(public.immutable_array_to_string(tags, ' '), ''))
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  price numeric(12,2),
  stock_qty int not null default 0 check (stock_qty >= 0),
  sku text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index product_variants_unique
  on public.product_variants(product_id, coalesce(size, ''), coalesce(color, ''));
create index product_variants_product_idx on public.product_variants(product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  alt_text text
);
create index product_images_product_idx on public.product_images(product_id);

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global','category','product')),
  category_id uuid references public.categories(id),
  product_id uuid references public.products(id),
  percent numeric(5,2) not null check (percent > 0 and percent <= 100),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint discounts_scope_match check (
    (scope = 'product'  and product_id  is not null and category_id is null) or
    (scope = 'category' and category_id is not null and product_id is null) or
    (scope = 'global'   and category_id is null and product_id is null)
  )
);
create index discounts_active_window_idx on public.discounts(is_active, starts_at, ends_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  text text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews(product_id) where is_approved;

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- settings (singleton-style config store)
-- ============================================================
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- orders / payments
-- ============================================================
create sequence public.order_number_seq start 1000;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('FS-' || nextval('public.order_number_seq')::text),
  user_id uuid not null references public.profiles(id),
  address_id uuid references public.addresses(id),

  ship_full_name text not null,
  ship_phone text not null,
  ship_region text not null,
  ship_city text not null,
  ship_address_line text not null,

  delivery_method text not null check (delivery_method in ('tashkent_courier','region_post')),
  delivery_zone_id uuid references public.delivery_zones(id),

  product_amount numeric(12,2) not null default 0,
  delivery_fee_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) generated always as (product_amount + delivery_fee_amount) stored,

  product_payment_method text not null default 'payme'
    check (product_payment_method in ('payme','cash')),
  product_payment_status text not null default 'pending'
    check (product_payment_status in ('pending','paid','failed','refunded')),
  delivery_fee_payment_method text not null default 'cash'
    check (delivery_fee_payment_method in ('cash','payme')),
  delivery_fee_payment_status text not null default 'pending_collection'
    check (delivery_fee_payment_status in ('pending_collection','collected','waived','paid')),

  status text not null default 'received'
    check (status in ('received','preparing','in_transit','delivered','cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  product_name_snapshot text not null,
  variant_label_snapshot text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  qty int not null check (qty > 0),
  line_total numeric(12,2) generated always as (unit_price * qty) stored
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history(order_id);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  provider text not null default 'payme',
  provider_transaction_id text unique,
  amount numeric(12,2) not null,
  state text not null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  performed_at timestamptz,
  cancelled_at timestamptz
);
create index payment_transactions_order_idx on public.payment_transactions(order_id);
