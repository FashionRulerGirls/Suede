-- ════════════════════════════════════════════════════════════════════
-- Suede — Security hardening (audit fixes C1 / H1 / H2)
-- Re-runnable: functions use CREATE OR REPLACE, triggers are dropped first.
-- These fixes are at the database layer; apply with `supabase db push`
-- (or run in the SQL editor) and verify against the project — they cannot
-- be exercised from the app's mock/guest fallback.
-- ════════════════════════════════════════════════════════════════════

-- ── C1 (CRITICAL): stop privilege escalation via profiles.is_admin ──────
-- The profiles_update policy (0002) is row-level only, so a signed-in user
-- could `update profiles set is_admin = true` on their own row. Postgres
-- RLS can't restrict individual columns, so guard is_admin with a trigger.
-- Non-user contexts (service role / SQL console) have a null auth.uid() and
-- are still allowed, so the documented admin bootstrap keeps working.
create or replace function public.enforce_profile_field_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'not authorized to modify is_admin';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_field_guard on public.profiles;
create trigger profiles_field_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_field_guard();

-- ── H1 (HIGH): suede_match must not be a measurement oracle ─────────────
-- Original bypassed measurements_public and never checked the caller, and
-- its linear score let an attacker binary-search a victim's exact numbers.
-- Now: the viewer must BE the caller, the target must have opted their
-- measurements public, and the score is quantised into 10-point bands so it
-- can no longer be inverted to recover per-dimension values to the inch.
create or replace function public.suede_match(viewer uuid, other uuid)
returns table (score int, confidence text)
language sql security definer stable set search_path = public as $$
  with a as (
    -- viewer must be the authenticated caller
    select m.* from measurements m
    where m.user_id = viewer and viewer = auth.uid()
  ),
  b as (
    -- target must have opted in to public measurements
    select m.* from measurements m
    join profiles p on p.id = m.user_id
    where m.user_id = other and p.measurements_public = true
  ),
  prox as (
    select greatest(0, 100 - round(
      ( abs(coalesce(a.bust_in,0)-coalesce(b.bust_in,0))
      + abs(coalesce(a.waist_in,0)-coalesce(b.waist_in,0))
      + abs(coalesce(a.hips_in,0)-coalesce(b.hips_in,0))
      + abs(coalesce(a.height_in,0)-coalesce(b.height_in,0)) ) * 2
    ))::int as raw_score
    from a, b
  ),
  conf as (
    select least(coalesce(a.source_confidence, 0.9),
                 coalesce(b.source_confidence, 0.9)) as w
    from a, b
  )
  select
    -- quantise to 10-pt bands: coarse enough that boundary-probing can't
    -- resolve the target's individual measurements
    least(100, greatest(0, (round((p.raw_score * c.w) / 10.0) * 10)::int)) as score,
    case when p.raw_score * c.w >= 85 then 'high'
         when p.raw_score * c.w >= 65 then 'medium'
         else 'low' end
  from prox p, conf c;
$$;

-- ── H2 (HIGH): honour hide_measurements at the data layer ───────────────
-- Reviews were selected with `*`, so measurements_snapshot shipped to every
-- viewer regardless of the author's "hide my measurements" choice — the
-- toggle was browser-only. Null the snapshot server-side whenever the review
-- is hidden, on write and for existing rows, so the data never leaves the DB.
-- (Trade-off: un-hiding a review later will have no stored snapshot.)
create or replace function public.strip_hidden_review_measurements()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.hide_measurements then
    new.measurements_snapshot := null;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_strip_hidden_measurements on public.reviews;
create trigger reviews_strip_hidden_measurements
  before insert or update on public.reviews
  for each row execute function public.strip_hidden_review_measurements();

-- one-time backfill of already-hidden reviews
update public.reviews
   set measurements_snapshot = null
 where hide_measurements and measurements_snapshot is not null;
