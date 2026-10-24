-- ════════════════════════════════════════════════════════════════════
-- 0041 — QC: hide a review from the Lookbook without removing it
-- ════════════════════════════════════════════════════════════════════
-- Admins need to pull low-quality reviews out of the public Lookbook feed (and
-- the community feeds that mirror it) while keeping them on the author's own
-- Collective profile — a quality-control hide, not a deletion.
--
-- lookbook_hidden = true keeps the review published (still visible on the
-- author's profile and readable by RLS) but the discovery feeds filter it out.
-- Admins can set it via the existing reviews_admin RLS policy (for all /
-- is_admin()).
--
-- Re-runnable. Run after 0001.
-- ════════════════════════════════════════════════════════════════════

alter table reviews add column if not exists lookbook_hidden boolean not null default false;

-- Speeds up the Lookbook feed's "published and not hidden, newest first" query.
create index if not exists reviews_lookbook_feed_idx
  on reviews (created_at desc)
  where status = 'published' and lookbook_hidden = false;
