-- Phase B: catalog lifecycle, pricing, inventory ledger and storefront CMS.
-- Internal enum values stay stable in English; every UI label is Uzbek.

create type public.product_status as enum ('draft', 'active', 'hidden', 'archived');
create type public.collection_status as enum ('draft', 'published', 'archived');
create type public.inventory_movement_type as enum (
  'purchase_receipt',
  'sale',
  'return',
  'manual_adjustment',
  'damaged_writeoff',
  'cancellation_release'
);

alter table public.products
  add column status public.product_status not null default 'draft',
  add column cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  add column published_at timestamptz,
  add column archived_at timestamptz,
  add column seo_title text,
  add column seo_description text;

-- Only the 20 products used by the current storefront stay public.
update public.products
set
  status = case
    when is_active and tags @> array['premium-curated']::text[] then 'active'::public.product_status
    else 'archived'::public.product_status
  end,
  is_active = is_active and tags @> array['premium-curated']::text[],
  published_at = case
    when is_active and tags @> array['premium-curated']::text[] then coalesce(updated_at, created_at)
    else null
  end,
  archived_at = case
    when is_active and tags @> array['premium-curated']::text[] then null
    else now()
  end;

create index products_status_created_idx on public.products(status, created_at desc);
create index products_archived_at_idx on public.products(archived_at desc)
  where status = 'archived';

alter table public.product_variants
  add column cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  add column reserved_qty integer not null default 0 check (reserved_qty >= 0),
  add column color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  add column sort_order integer not null default 0,
  add constraint product_variants_reserved_not_above_stock check (reserved_qty <= stock_qty);

alter table public.order_items
  add column unit_cost_snapshot numeric(12,2)
    check (unit_cost_snapshot is null or unit_cost_snapshot >= 0),
  add column discount_snapshot numeric(12,2) not null default 0
    check (discount_snapshot >= 0),
  add column line_cost numeric(12,2)
    generated always as (unit_cost_snapshot * qty) stored,
  add column line_gross_profit numeric(12,2)
    generated always as ((unit_price * qty) - (unit_cost_snapshot * qty)) stored;

create or replace function private.sync_product_legacy_active()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'draft' and new.is_active then
      new.status := 'active';
    end if;
  elsif new.status is distinct from old.status then
    new.is_active := new.status = 'active';
  elsif new.is_active is distinct from old.is_active then
    new.status := case
      when new.is_active then 'active'::public.product_status
      else 'archived'::public.product_status
    end;
  end if;

  if new.status = 'active' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'archived' and new.archived_at is null then
    new.archived_at := now();
  elsif new.status <> 'archived' then
    new.archived_at := null;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_product_legacy_active() from public;
grant execute on function private.sync_product_legacy_active() to authenticated, service_role;

create trigger sync_product_legacy_active
  before insert or update of status, is_active on public.products
  for each row execute function private.sync_product_legacy_active();

create table public.product_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  shared_description text,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_group_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.product_groups(id) on delete cascade,
  product_id uuid not null unique references public.products(id) on delete cascade,
  color_name text not null,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (group_id, color_name)
);
create index product_group_items_group_idx
  on public.product_group_items(group_id, sort_order);

create table public.product_relations (
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  relation_type text not null check (relation_type in ('related', 'cross_sell')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, related_product_id, relation_type),
  check (product_id <> related_product_id)
);
create index product_relations_related_idx on public.product_relations(related_product_id);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity_delta integer not null check (quantity_delta <> 0),
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  unit_cost numeric(12,2) check (unit_cost is null or unit_cost >= 0),
  order_id uuid references public.orders(id) on delete set null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (quantity_after = quantity_before + quantity_delta)
);
create index inventory_movements_variant_created_idx
  on public.inventory_movements(variant_id, created_at desc);
create index inventory_movements_order_idx on public.inventory_movements(order_id);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'product-images',
  storage_path text not null,
  public_url text not null,
  file_name text not null,
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text,
  is_public boolean not null default true,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, storage_path)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  kind text not null default 'manual' check (kind in ('manual', 'rule_based')),
  rules jsonb not null default '{}'::jsonb,
  status public.collection_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);
create index collection_products_order_idx
  on public.collection_products(collection_id, sort_order);

create table public.site_pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status public.collection_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  section_key text not null,
  section_type text not null check (section_type in (
    'hero',
    'trust_benefits',
    'sport_navigation',
    'featured_campaign',
    'product_collection',
    'sport_finder',
    'promotional'
  )),
  published_content jsonb not null default '{}'::jsonb,
  draft_content jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index site_sections_page_order_idx on public.site_sections(page_id, sort_order);

create table public.site_content_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  snapshot jsonb not null,
  change_note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (page_id, version_number)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'payment_fee',
    'delivery',
    'marketing',
    'operating',
    'other'
  )),
  amount numeric(12,2) not null check (amount > 0),
  incurred_at date not null,
  description text,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index expenses_incurred_at_idx on public.expenses(incurred_at desc);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_created_idx on public.admin_audit_log(created_at desc);
create index admin_audit_log_entity_idx
  on public.admin_audit_log(entity_type, entity_id, created_at desc);

insert into public.collections (name, slug, description, kind, status, published_at)
values (
  'Bosh sahifa saralangan mahsulotlari',
  'homepage-curated',
  'Eski premium-curated belgisi asosida ko‘chirilgan mahsulotlar',
  'manual',
  'published',
  now()
);

insert into public.collection_products (collection_id, product_id, sort_order)
select c.id, p.id, row_number() over (order by p.created_at, p.id)::integer - 1
from public.collections c
cross join public.products p
where c.slug = 'homepage-curated'
  and p.status = 'active';

insert into public.site_pages (name, slug, status, published_at)
values ('Bosh sahifa', 'homepage', 'published', now());

-- Replace legacy catalog policies with lifecycle-aware visibility rules.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select
  to anon, authenticated
  using (status in ('active', 'hidden') or (select public.is_admin()));

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read" on public.product_variants
  for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and p.status in ('active', 'hidden')
    )
    or (select public.is_admin())
  );

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status in ('active', 'hidden')
    )
    or (select public.is_admin())
  );

alter table public.product_groups enable row level security;
alter table public.product_group_items enable row level security;
alter table public.product_relations enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.media_assets enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_sections enable row level security;
alter table public.site_content_versions enable row level security;
alter table public.expenses enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "product_groups_public_read" on public.product_groups
  for select to anon, authenticated using (
    exists (
      select 1
      from public.product_group_items pgi
      join public.products p on p.id = pgi.product_id
      where pgi.group_id = product_groups.id
        and p.status in ('active', 'hidden')
    )
    or (select public.is_admin())
  );
create policy "product_groups_admin_write" on public.product_groups
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "product_group_items_public_read" on public.product_group_items
  for select to anon, authenticated using (
    exists (
      select 1 from public.products p
      where p.id = product_group_items.product_id
        and p.status in ('active', 'hidden')
    )
    or (select public.is_admin())
  );
create policy "product_group_items_admin_write" on public.product_group_items
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "product_relations_public_read" on public.product_relations
  for select to anon, authenticated using (
    exists (
      select 1 from public.products p
      where p.id = product_relations.product_id and p.status in ('active', 'hidden')
    )
    and exists (
      select 1 from public.products p
      where p.id = product_relations.related_product_id and p.status in ('active', 'hidden')
    )
    or (select public.is_admin())
  );
create policy "product_relations_admin_write" on public.product_relations
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "inventory_movements_admin_only" on public.inventory_movements
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "media_assets_public_read" on public.media_assets
  for select to anon, authenticated using (is_public or (select public.is_admin()));
create policy "media_assets_admin_write" on public.media_assets
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "collections_public_read" on public.collections
  for select to anon, authenticated using (
    status = 'published' or (select public.is_admin())
  );
create policy "collections_admin_write" on public.collections
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "collection_products_public_read" on public.collection_products
  for select to anon, authenticated using (
    exists (
      select 1 from public.collections c
      where c.id = collection_products.collection_id and c.status = 'published'
    )
    and exists (
      select 1 from public.products p
      where p.id = collection_products.product_id and p.status = 'active'
    )
    or (select public.is_admin())
  );
create policy "collection_products_admin_write" on public.collection_products
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "site_pages_public_read" on public.site_pages
  for select to anon, authenticated using (
    status = 'published' or (select public.is_admin())
  );
create policy "site_pages_admin_write" on public.site_pages
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "site_sections_public_read" on public.site_sections
  for select to anon, authenticated using (
    is_visible
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
    and exists (
      select 1 from public.site_pages p
      where p.id = site_sections.page_id and p.status = 'published'
    )
    or (select public.is_admin())
  );
create policy "site_sections_admin_write" on public.site_sections
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "site_content_versions_admin_only" on public.site_content_versions
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "expenses_admin_only" on public.expenses
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "admin_audit_log_admin_only" on public.admin_audit_log
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.product_groups, public.product_group_items,
  public.product_relations, public.media_assets, public.collections,
  public.collection_products, public.site_pages, public.site_sections
  to anon;

grant select, insert, update, delete on public.product_groups,
  public.product_group_items, public.product_relations,
  public.inventory_movements, public.media_assets, public.collections,
  public.collection_products, public.site_pages, public.site_sections,
  public.site_content_versions, public.expenses, public.admin_audit_log
  to authenticated;

grant select, insert, update, delete on public.product_groups,
  public.product_group_items, public.product_relations,
  public.inventory_movements, public.media_assets, public.collections,
  public.collection_products, public.site_pages, public.site_sections,
  public.site_content_versions, public.expenses, public.admin_audit_log
  to service_role;

grant usage, select on sequence public.admin_audit_log_id_seq
  to authenticated, service_role;
