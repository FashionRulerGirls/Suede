-- ════════════════════════════════════════════════════════════════════
-- Suede — Admin dashboard support (Phase 1).
--  • Let the client ask "am I admin?" so it can gate the /admin UI. is_admin()
--    is SECURITY DEFINER and only reads the caller's own row, so exposing it is
--    safe. Row access to admin data is still governed by the existing RLS.
--  • Onboarding-timing fields for the overview metrics: when a profile's
--    measurements were first completed, and when a review / inquiry form was
--    opened (logged client-side and passed on submit).
-- Re-runnable.
-- ════════════════════════════════════════════════════════════════════

grant execute on function public.is_admin() to authenticated;

alter table profiles  add column if not exists measurements_completed_at timestamptz;
alter table reviews   add column if not exists review_started_at timestamptz;
alter table inquiries add column if not exists inquiry_started_at timestamptz;

-- Stamp profiles.measurements_completed_at the first time bust+waist+hips are
-- all present (any entry path: consultation, quiz, or manual). Server-side so
-- it can't be missed or spoofed by the client.
create or replace function public.stamp_measurements_completed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.bust_in is not null and new.waist_in is not null and new.hips_in is not null then
    update public.profiles
       set measurements_completed_at = coalesce(measurements_completed_at, now())
     where id = new.user_id and measurements_completed_at is null;
  end if;
  return new;
end $$;

drop trigger if exists trg_measurements_completed on measurements;
create trigger trg_measurements_completed
  after insert or update on measurements
  for each row execute function public.stamp_measurements_completed();
