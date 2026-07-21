-- Phase A: authorization defense in depth for admin and user mutations.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;

-- Keep the existing policy API stable while moving the privileged lookup out
-- of the exposed public schema. This wrapper does not bypass RLS itself.
create or replace function public.is_admin()
returns boolean
language sql
security invoker
set search_path = ''
stable
as $$
  select private.is_admin();
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id or (select public.is_admin()))
  with check ((select auth.uid()) = id or (select public.is_admin()));

create or replace function private.protect_profile_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin')
    and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
    and not private.is_admin()
    and (
    new.id is distinct from old.id
    or new.role is distinct from old.role
  ) then
    raise exception 'Admin rolini o''zgartirishga ruxsat yo''q'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_admin_fields() from public;
grant execute on function private.protect_profile_admin_fields() to authenticated, service_role;

drop trigger if exists protect_profile_admin_fields on public.profiles;
create trigger protect_profile_admin_fields
  before update on public.profiles
  for each row execute function private.protect_profile_admin_fields();

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and is_approved = false
  );

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin" on public.reviews
  for update
  to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()))
  with check ((select auth.uid()) = user_id or (select public.is_admin()));

create or replace function private.protect_review_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin')
    and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
    and not private.is_admin()
    and (
    new.user_id is distinct from old.user_id
    or new.product_id is distinct from old.product_id
    or new.is_approved is distinct from old.is_approved
  ) then
    raise exception 'Sharh tasdig‘ini o''zgartirishga ruxsat yo''q'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_review_admin_fields() from public;
grant execute on function private.protect_review_admin_fields() to authenticated, service_role;

drop trigger if exists protect_review_admin_fields on public.reviews;
create trigger protect_review_admin_fields
  before update on public.reviews
  for each row execute function private.protect_review_admin_fields();
