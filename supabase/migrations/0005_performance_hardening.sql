-- Flexsport.uz — performance advisor fixes: missing FK indexes + RLS initplan caching

create index addresses_delivery_zone_idx on public.addresses(delivery_zone_id);
create index discounts_category_idx on public.discounts(category_id);
create index discounts_product_idx on public.discounts(product_id);
create index order_items_variant_idx on public.order_items(variant_id);
create index order_status_history_changed_by_idx on public.order_status_history(changed_by);
create index orders_address_idx on public.orders(address_id);
create index orders_delivery_zone_idx on public.orders(delivery_zone_id);
create index reviews_user_idx on public.reviews(user_id);
create index wishlist_items_product_idx on public.wishlist_items(product_id);

-- Re-create RLS policies wrapping auth.uid() in a scalar subquery so Postgres
-- evaluates it once per statement instead of once per row.

drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using ((select auth.uid()) = id or public.is_admin());

drop policy "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using ((select auth.uid()) = id or public.is_admin());

drop policy "addresses_all_own" on public.addresses;
create policy "addresses_all_own" on public.addresses
  for all using ((select auth.uid()) = user_id or public.is_admin())
  with check ((select auth.uid()) = user_id or public.is_admin());

drop policy "reviews_select_approved_or_own_or_admin" on public.reviews;
create policy "reviews_select_approved_or_own_or_admin" on public.reviews
  for select using (is_approved or (select auth.uid()) = user_id or public.is_admin());

drop policy "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check ((select auth.uid()) = user_id);

drop policy "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin" on public.reviews
  for update using ((select auth.uid()) = user_id or public.is_admin());

drop policy "reviews_delete_own_or_admin" on public.reviews;
create policy "reviews_delete_own_or_admin" on public.reviews
  for delete using ((select auth.uid()) = user_id or public.is_admin());

drop policy "wishlist_all_own" on public.wishlist_items;
create policy "wishlist_all_own" on public.wishlist_items
  for all using ((select auth.uid()) = user_id or public.is_admin())
  with check ((select auth.uid()) = user_id or public.is_admin());

drop policy "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using ((select auth.uid()) = user_id or public.is_admin());

drop policy "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check ((select auth.uid()) = user_id);

drop policy "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = (select auth.uid()) or public.is_admin())
    )
  );

drop policy "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );

drop policy "order_status_history_select_own_or_admin" on public.order_status_history;
create policy "order_status_history_select_own_or_admin" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (o.user_id = (select auth.uid()) or public.is_admin())
    )
  );
