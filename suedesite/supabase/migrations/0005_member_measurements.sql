-- ════════════════════════════════════════════════════════════════════
-- Suede — expose a member's measurements to the community WHEN they've kept
-- them public (measurements_public = true). Measurements are otherwise
-- owner-only via RLS; this security-definer function is the controlled read.
-- Run in the Supabase SQL editor after 0001–0004.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.member_measurements(uid uuid)
returns table (
  height_in numeric, bust_in numeric, waist_in numeric, hips_in numeric,
  inseam_in numeric, shoulder_in numeric, arm_in numeric, torso_in numeric,
  usual_sizes jsonb
)
language sql security definer stable set search_path = public as $$
  select m.height_in, m.bust_in, m.waist_in, m.hips_in,
         m.inseam_in, m.shoulder_in, m.arm_in, m.torso_in, m.usual_sizes
  from measurements m
  join profiles p on p.id = m.user_id
  where m.user_id = uid and p.measurements_public = true;
$$;
