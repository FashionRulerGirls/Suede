-- ════════════════════════════════════════════════════════════════════
-- Suede — Security hardening (audit follow-ups: brand-owner guard + is_admin)
-- Re-runnable. Apply with `supabase db push` (or paste into the SQL editor).
-- ════════════════════════════════════════════════════════════════════

-- ── Brand owners must not rewrite curated columns ───────────────────────
-- brands_owner (0002) is `for update using (auth.uid() = owner_id)` with no
-- column restriction, so an owner could change owner_id (hand off / orphan
-- the brand), status (self-publish, bypassing review) or is_capsule
-- (self-promote to a featured capsule). RLS can't guard columns, so a
-- trigger blocks non-admins from changing these three. Admins (brands_write)
-- and non-user contexts (service role / SQL console, auth.uid() null) are
-- unaffected, and owners keep editing every other field.
create or replace function public.enforce_brand_owner_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.owner_id  is distinct from old.owner_id
       or new.status is distinct from old.status
       or new.is_capsule is distinct from old.is_capsule then
      raise exception 'not authorized to modify owner_id, status, or is_capsule';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists brands_owner_guard on public.brands;
create trigger brands_owner_guard
  before update on public.brands
  for each row execute function public.enforce_brand_owner_guard();

-- ── Stop exposing profiles.is_admin to public reads ─────────────────────
-- profiles_read is `using (true)`, so anyone could SELECT is_admin and
-- enumerate admin accounts. Postgres column privileges only take effect once
-- the blanket table-level SELECT is removed, so revoke it and re-grant SELECT
-- on every column EXCEPT is_admin. (RLS still governs which rows are visible;
-- this only removes one column from the public column set. is_admin() is
-- SECURITY DEFINER and keeps working; service_role is unaffected.)
revoke select on public.profiles from anon, authenticated;
grant  select (
  id, username, display_name, bio, avatar_url, instagram, tiktok, website,
  measurements_public, email_notifications, show_in_collective,
  accepted_terms_at, created_at
) on public.profiles to anon, authenticated;
