-- ════════════════════════════════════════════════════════════════════
-- 0035 — Collective inclusion == admin "complete profile"
-- ════════════════════════════════════════════════════════════════════
-- The admin dashboard counts a profile "complete" when the member has their
-- three core body measurements (bust, waist, hips). The Collective directory,
-- however, required more than that — a display name, an avatar, a bio, AND a
-- height — so members the dashboard called "complete" were missing from the
-- Collective. This aligns the Collective gate with the dashboard's definition.
--
-- After this migration a member appears in the Collective when:
--   • they are opted in (show_in_collective — on by default; turning it off is
--     the member's own privacy choice, so it stays a gate), AND
--   • they have bust + waist + hips measurements (the dashboard's definition).
--
-- Dropped requirements: height, display_name, avatar_url, bio. The card renders
-- fine without them (initials avatar when there's no photo, username when there
-- is no display name), so no empty/broken cards result.
--
-- Signature is unchanged from 0033, so create-or-replace is enough.
-- Re-runnable. Run after 0033.
-- ════════════════════════════════════════════════════════════════════

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
    and m.bust_in  is not null
    and m.waist_in is not null
    and m.hips_in  is not null
  order by p.created_at desc;
$$;
