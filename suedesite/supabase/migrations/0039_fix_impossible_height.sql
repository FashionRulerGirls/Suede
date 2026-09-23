-- ════════════════════════════════════════════════════════════════════
-- 0039 — Clear impossible stored heights from the old free-text field
-- ════════════════════════════════════════════════════════════════════
-- The Edit Profile height field used to be free text parsed loosely, so an
-- entry like "5 11" or "511" (no apostrophe) was read as 511 INCHES and shown
-- as 42'7". Height entry is now two dropdowns (feet + inches), which can't
-- produce this, but existing rows may still hold impossible values.
--
-- Null any height above 96 inches (8 ft) — not a real human height, so these
-- are unambiguously the parse bug. The affected members read as incomplete and
-- are prompted to re-pick their height with the new picker. (Subtler wrong
-- values that still fall in a plausible range can't be detected and are left
-- for the member to correct.) Other measurements are untouched.
--
-- Idempotent. Run after 0001.
-- ════════════════════════════════════════════════════════════════════

update measurements
set height_in = null, updated_at = now()
where height_in > 96;
