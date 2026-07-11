-- Flexsport.uz — RLS policies

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.discounts enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_transactions enable row level security;

-- profiles: owner + admin
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- addresses: owner + admin
create policy "addresses_all_own" on public.addresses
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- public catalog reference data: public read, admin write
create policy "delivery_zones_public_read" on public.delivery_zones
  for select using (is_active or public.is_admin());
create policy "delivery_zones_admin_write" on public.delivery_zones
  for insert with check (public.is_admin());
create policy "delivery_zones_admin_update" on public.delivery_zones
  for update using (public.is_admin());
create policy "delivery_zones_admin_delete" on public.delivery_zones
  for delete using (public.is_admin());

create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());
create policy "categories_admin_write" on public.categories
  for insert with check (public.is_admin());
create policy "categories_admin_update" on public.categories
  for update using (public.is_admin());
create policy "categories_admin_delete" on public.categories
  for delete using (public.is_admin());

create policy "brands_public_read" on public.brands
  for select using (true);
create policy "brands_admin_write" on public.brands
  for insert with check (public.is_admin());
create policy "brands_admin_update" on public.brands
  for update using (public.is_admin());
create policy "brands_admin_delete" on public.brands
  for delete using (public.is_admin());

create policy "products_public_read" on public.products
  for select using (is_active or public.is_admin());
create policy "products_admin_write" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

create policy "product_variants_public_read" on public.product_variants
  for select using (is_active or public.is_admin());
create policy "product_variants_admin_write" on public.product_variants
  for insert with check (public.is_admin());
create policy "product_variants_admin_update" on public.product_variants
  for update using (public.is_admin());
create policy "product_variants_admin_delete" on public.product_variants
  for delete using (public.is_admin());

create policy "product_images_public_read" on public.product_images
  for select using (true);
create policy "product_images_admin_write" on public.product_images
  for insert with check (public.is_admin());
create policy "product_images_admin_update" on public.product_images
  for update using (public.is_admin());
create policy "product_images_admin_delete" on public.product_images
  for delete using (public.is_admin());

create policy "discounts_public_read" on public.discounts
  for select using (is_active or public.is_admin());
create policy "discounts_admin_write" on public.discounts
  for insert with check (public.is_admin());
create policy "discounts_admin_update" on public.discounts
  for update using (public.is_admin());
create policy "discounts_admin_delete" on public.discounts
  for delete using (public.is_admin());

create policy "settings_public_read" on public.settings
  for select using (true);
create policy "settings_admin_write" on public.settings
  for insert with check (public.is_admin());
create policy "settings_admin_update" on public.settings
  for update using (public.is_admin());

-- reviews: public sees only approved, owner can insert/update own, admin full
create policy "reviews_select_approved_or_own_or_admin" on public.reviews
  for select using (is_approved or auth.uid() = user_id or public.is_admin());
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews_update_own_or_admin" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());
create policy "reviews_delete_own_or_admin" on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- wishlist: owner only
create policy "wishlist_all_own" on public.wishlist_items
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- orders: owner select/insert, admin full; status updates admin-only
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "order_status_history_select_own_or_admin" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_status_history_insert_admin" on public.order_status_history
  for insert with check (public.is_admin());

-- payment_transactions: no client access at all (service-role bypasses RLS)
