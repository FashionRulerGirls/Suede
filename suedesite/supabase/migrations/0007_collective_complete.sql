-- ════════════════════════════════════════════════════════════════════
-- Suede — only COMPLETE profiles appear in The Collective.
--
-- "Complete" = opted in (show_in_collective) AND has a display name, an
-- avatar, a bio, and the four core measurements (height, bust, waist, hips)
-- that power Suede Match. Measurements are owner-only under RLS, so this
-- security-definer function checks them without ever exposing the values —
-- it returns only the public profile fields.
--
-- Run after 0001–0006.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.collective_members()
returns table (id uuid, username text, display_name text, avatar_url text, bio text)
language sql security definer stable set search_path = public as $$
  select p.id, p.username, p.display_name, p.avatar_url, p.bio
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
