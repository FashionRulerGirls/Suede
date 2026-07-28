-- ════════════════════════════════════════════════════════════════════
-- 0033 — Richer Collective cards: measurements + activity stats
-- ════════════════════════════════════════════════════════════════════
-- The Collective directory cards were restyled to match the home-page member
-- card, which shows a measurement spec and a Reviews / Inquiries / Followers
-- footer. This extends collective_members() to return those in one query
-- (security-definer, so it can read measurements without exposing them broadly):
--   • the four core measurements — ONLY when the member set measurements_public
--   • published-review, non-removed-inquiry, and follower counts
-- All members returned already have the four core measurements (that's the
-- Collective completeness gate); measurements_public only controls display.
-- Re-runnable. Run after 0007.

create or replace function public.collective_members()
returns table (
  id uuid, username text, display_name text, avatar_url text, bio text,
  height_in numeric, bust_in numeric, waist_in numeric, hips_in numeric,
  reviews_count bigint, inquiries_count bigint, followers_count bigint
)
language sql security definer stable set search_path = public as $$
  select
    p.id, p.username, p.display_name, p.avatar_url, p.bio,
    case when p.measurements_public then m.height_in end,
    case when p.measurements_public then m.bust_in  end,
    case when p.measurements_public then m.waist_in end,
    case when p.measurements_public then m.hips_in  end,
    (select count(*) from reviews   r where r.author_id = p.id and r.status = 'published'),
    (select count(*) from inquiries i where i.author_id = p.id and i.status <> 'removed'),
    (select count(*) from member_follows f where f.followee_id = p.id)
  from profiles p
  join measurements m on m.user_id = p.id
  where p.show_in_collective = true
    and coalesce(btrim(p.display_name), '') <> ''
    and coalesce(btrim(p.avatar_url), '') <> ''
    and coalesce(btrim(p.bio), '') <> ''
    and m.height_in is not null
    and m.bust_in  is not null
    and m.waist_in is not null
    and m.hips_in  is not null
  order by p.created_at desc;
$$;
