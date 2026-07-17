-- ════════════════════════════════════════════════════════════════════
-- Suede — Store the product price on reviews & inquiries so it shows in the
-- item's purchase details. Text (carries currency, e.g. "£245"); captured
-- from the Fetch result or entered manually. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
alter table reviews   add column if not exists product_price text;
alter table inquiries add column if not exists product_price text;
