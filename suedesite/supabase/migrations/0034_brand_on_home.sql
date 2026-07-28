-- ════════════════════════════════════════════════════════════════════
-- 0034 — Feature a Capsule brand on the home-page marquee
-- ════════════════════════════════════════════════════════════════════
-- The admin "Add Brand" form can flag a brand to also appear in the home-page
-- brand marquee (in addition to the Capsule directory). Null/false = directory
-- only. Writes are already covered by the admin brands policy. Re-runnable.

alter table brands add column if not exists on_home boolean not null default false;
