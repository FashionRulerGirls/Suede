-- ════════════════════════════════════════════════════════════════════
-- 0027 — Track the (manual) brand-owner welcome email on the claim
-- ════════════════════════════════════════════════════════════════════
-- After an admin approves a claim, the owner is emailed by hand (for now). The
-- dashboard needs to know which approved claims still need that email, so record
-- when it was sent. Null = approved but not yet emailed. Re-runnable.

alter table brand_claims add column if not exists notified_at timestamptz;
