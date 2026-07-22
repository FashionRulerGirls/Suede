-- ════════════════════════════════════════════════════════════════════
-- 0031 — Admin decision note on flags, visible to the brand
-- ════════════════════════════════════════════════════════════════════
-- When a brand flags a review/inquiry, the admin can now reply with a short
-- decision (kept / removed / dismissed + a note) instead of only removing
-- content. The note is stored on the flag, and the brand that raised it can read
-- its own flags to see the outcome. Re-runnable.

alter table moderation_flags add column if not exists resolution_note text;

-- Let the reporter read the flags they raised (in addition to the admin policy),
-- so the portal can show them the outcome.
drop policy if exists mflag_reporter_read on moderation_flags;
create policy mflag_reporter_read on moderation_flags for select using (auth.uid() = raised_by);

grant select on moderation_flags to authenticated; -- rows still gated by RLS
