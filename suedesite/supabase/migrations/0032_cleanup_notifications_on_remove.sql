-- ════════════════════════════════════════════════════════════════════
-- Suede — make a deletion follow through everywhere.
--
-- Reviews and inquiries are soft-deleted (status → 'removed') by both the
-- author (lib/contentData.ts) and admin moderation (lib/adminActions.ts).
-- The feeds and detail loaders already skip 'removed' rows, but the
-- notifications generated for that content (comments, responses, reactions —
-- see 0006) were left behind, so a like/comment on a now-deleted review kept
-- showing in the recipient's bell.
--
-- These security-definer triggers delete the matching notifications the moment
-- a review/inquiry is removed, so the bell (and its unread count) stays in sync
-- with what's actually reachable. Run after 0006. Idempotent.
-- ════════════════════════════════════════════════════════════════════

-- ── review removed → drop its notifications ──────────────────────────
-- Every review-related notification (review_comment, and reactions on the
-- review or its comments) navigates to the review, so it carries
-- entity_type='review' + entity_id = the review id (see 0006).
create or replace function public.cleanup_notifications_on_review_remove()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'removed' and coalesce(old.status, '') <> 'removed' then
    delete from notifications
      where entity_type = 'review' and entity_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists trg_cleanup_notifs_review on reviews;
create trigger trg_cleanup_notifs_review
  after update of status on reviews
  for each row execute function public.cleanup_notifications_on_review_remove();

-- ── inquiry removed → drop its notifications ─────────────────────────
create or replace function public.cleanup_notifications_on_inquiry_remove()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'removed' and coalesce(old.status, '') <> 'removed' then
    delete from notifications
      where entity_type = 'inquiry' and entity_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists trg_cleanup_notifs_inquiry on inquiries;
create trigger trg_cleanup_notifs_inquiry
  after update of status on inquiries
  for each row execute function public.cleanup_notifications_on_inquiry_remove();

-- ── one-time backfill: clear notifications already orphaned ───────────
-- Delete any review/inquiry notification whose target no longer resolves to a
-- non-removed row (removed content, or the row itself is gone).
delete from notifications n
  where n.entity_type = 'review'
    and not exists (
      select 1 from reviews r where r.id = n.entity_id and r.status <> 'removed'
    );

delete from notifications n
  where n.entity_type = 'inquiry'
    and not exists (
      select 1 from inquiries i where i.id = n.entity_id and i.status <> 'removed'
    );
