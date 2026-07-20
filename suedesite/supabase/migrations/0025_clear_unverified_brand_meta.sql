-- ════════════════════════════════════════════════════════════════════
-- 0025 — Clear unverified brand meta
-- ════════════════════════════════════════════════════════════════════
-- founder / founded_year / location were seeded with guessed values for the
-- Capsule brands. On a trust platform, unverified data is worse than none —
-- these fields must come from each brand directly (via the portal). Wipe the
-- seeded guesses so the brand cards show nothing until a brand fills them in.
--
-- Only clears rows that were never claimed/edited by an owner, so we don't blow
-- away real data a brand has since entered.
-- Re-runnable.

update brands
   set founder      = null,
       founded_year = null,
       location     = null
 where owner_id is null;
