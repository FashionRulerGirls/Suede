-- ════════════════════════════════════════════════════════════════════
-- Suede — Store a review's linked social video (TikTok / Instagram). The
-- create-review form already collects it; this is where it lands so we can
-- show it embedded on the review page and, later, in the brand-page
-- "Seen in real life" strip. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
alter table reviews add column if not exists content_link text;
