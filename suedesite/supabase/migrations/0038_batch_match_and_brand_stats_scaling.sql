-- ════════════════════════════════════════════════════════════════════
-- 0038 — Scalability: batch Suede Match + bound brand_stats work
-- ════════════════════════════════════════════════════════════════════
-- Two "gets worse as data grows" fixes:
--
--  1) suede_match_many(): the app was calling suede_match(viewer, other) once
--     PER member (≈60 round-trips on The Collective, plus one per review/inquiry
--     author in feeds). This batch version returns every match in a single call.
--     It preserves the exact security + scoring semantics of suede_match (0008):
--       • the viewer must be the authenticated caller (viewer = auth.uid()),
--       • each target must have opted measurements public,
--       • the score is quantised into 10-point bands so it can't be inverted to
--         recover a member's per-dimension measurements.
--
--  2) Indexes so brand_stats aggregates each brand's reviews/inquiries via an
--     index instead of scanning. Combined with the app change to fetch stats
--     only for the brands actually being displayed (filtering on the view's
--     GROUP BY key pushes the work down to those brands), this bounds the
--     aggregate to what's on screen rather than the whole catalog.
--
-- Re-runnable. Run after 0008.
-- ════════════════════════════════════════════════════════════════════

-- ── 1) Batch Suede Match ────────────────────────────────────────────
create or replace function public.suede_match_many(viewer uuid, others uuid[])
returns table (other uuid, score int, confidence text)
language sql security definer stable set search_path = public as $$
  with a as (
    -- viewer must be the authenticated caller
    select m.* from measurements m
    where m.user_id = viewer and viewer = auth.uid()
  ),
  b as (
    -- only targets that opted in to public measurements
    select m.* from measurements m
    join profiles p on p.id = m.user_id
    where m.user_id = any(others) and p.measurements_public = true
  ),
  calc as (
    select
      b.user_id as other,
      greatest(0, 100 - round(
        ( abs(coalesce(a.bust_in,0)-coalesce(b.bust_in,0))
        + abs(coalesce(a.waist_in,0)-coalesce(b.waist_in,0))
        + abs(coalesce(a.hips_in,0)-coalesce(b.hips_in,0))
        + abs(coalesce(a.height_in,0)-coalesce(b.height_in,0)) ) * 2
      ))::int as raw_score,
      least(coalesce(a.source_confidence, 0.9),
            coalesce(b.source_confidence, 0.9)) as w
    from a cross join b
  )
  select
    calc.other,
    -- quantise to 10-pt bands: matches suede_match() exactly
    least(100, greatest(0, (round((calc.raw_score * calc.w) / 10.0) * 10)::int)) as score,
    case when calc.raw_score * calc.w >= 85 then 'high'
         when calc.raw_score * calc.w >= 65 then 'medium'
         else 'low' end
  from calc;
$$;

-- ── 2) Indexes for bounded brand_stats aggregation ──────────────────
create index if not exists reviews_brand_id_status_idx on reviews(brand_id, status);
create index if not exists inquiries_brand_id_idx        on inquiries(brand_id);
