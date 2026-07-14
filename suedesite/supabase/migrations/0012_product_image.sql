-- ════════════════════════════════════════════════════════════════════
-- Suede — Store the fetched product image on reviews & inquiries so the
-- "Search Existing" product bank can show a thumbnail per product. This is
-- the og:image pulled by the Fetch control, distinct from user-uploaded
-- review photos (media table). Re-runnable.
-- ════════════════════════════════════════════════════════════════════
alter table reviews   add column if not exists product_image_url text;
alter table inquiries add column if not exists product_image_url text;
