-- ════════════════════════════════════════════════════════════════════
-- 0036 — One-time cleanup: clear stub measurements from the old AI quiz
-- ════════════════════════════════════════════════════════════════════
-- Before the quiz was wired to a real model, lib/claude.ts was a stub that
-- returned the SAME hardcoded estimate for every quiz-taker:
--   bust 35, waist 28, hips 39, inseam 30  (source = 'quiz')
-- So every member who used the quiz shares those exact numbers. This clears
-- those fabricated values so the affected members read as incomplete and are
-- re-prompted to (re)take the now-real quiz.
--
-- Scope is deliberately tight and safe:
--   • ONLY rows with source = 'quiz' AND all four values equal to the stub
--     (35 / 28 / 39 / 30). A genuine post-fix estimate hitting all four exact
--     stub numbers at once is vanishingly unlikely, so real data is preserved.
--   • Self-input ('manual') and tape/consultation ('tape') rows are untouched.
--   • height_in and usual_sizes are kept — those came from the member's own
--     answers, not the stub.
-- Only the fabricated body measurements + their source/confidence are cleared.
--
-- Idempotent: re-running matches nothing once cleared. Run after 0001.
-- ════════════════════════════════════════════════════════════════════

update measurements
set
  bust_in = null,
  waist_in = null,
  hips_in = null,
  inseam_in = null,
  source = null,
  source_confidence = null,
  updated_at = now()
where source = 'quiz'
  and bust_in = 35
  and waist_in = 28
  and hips_in = 39
  and inseam_in = 30;
