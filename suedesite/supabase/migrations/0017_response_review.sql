-- ════════════════════════════════════════════════════════════════════
-- Suede — Let a member back an inquiry response with one of their reviews.
-- The response can cite a review (e.g. "here's my review of this exact dress")
-- so the asker can open the full write-up. Nullable; if the review is later
-- deleted the response survives with the citation cleared. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
alter table inquiry_responses
  add column if not exists review_id uuid references reviews(id) on delete set null;

create index if not exists inquiry_responses_review_id_idx
  on inquiry_responses (review_id);
