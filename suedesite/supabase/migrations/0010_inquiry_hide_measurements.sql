-- ════════════════════════════════════════════════════════════════════
-- Suede — Honour hide_measurements on inquiries (parity with reviews / H2)
-- The inquiries table already has a hide_measurements column, but nothing
-- enforced it: the snapshot shipped to every viewer. Reuse the same
-- strip-on-write function 0008 defined for reviews so a hidden inquiry never
-- stores its measurements_snapshot. Re-runnable.
-- ════════════════════════════════════════════════════════════════════

-- The inquiries table (unlike reviews) never had a hide_measurements column,
-- so add it first.
alter table public.inquiries
  add column if not exists hide_measurements boolean not null default false;

-- strip_hidden_review_measurements() (from 0008) is table-agnostic — it only
-- touches NEW.hide_measurements / NEW.measurements_snapshot, both of which
-- inquiries now have — so we can bind it to inquiries too.
drop trigger if exists inquiries_strip_hidden_measurements on public.inquiries;
create trigger inquiries_strip_hidden_measurements
  before insert or update on public.inquiries
  for each row execute function public.strip_hidden_review_measurements();

-- one-time backfill of any already-hidden inquiries
update public.inquiries
   set measurements_snapshot = null
 where hide_measurements and measurements_snapshot is not null;
