-- ════════════════════════════════════════════════════════════════════
-- 0040 — Customer service becomes a BRAND-level rating (product-agnostic)
-- ════════════════════════════════════════════════════════════════════
-- Customer service is a property of the brand, not of a single product, so it
-- no longer belongs among a product review's per-item ratings. This adds a
-- brand-level rating: one score per member per brand, updatable.
--
--   • brand_service_ratings  — (user_id, brand_id) → rating 1–5.
--   • brand_service_stats()  — SECURITY DEFINER aggregate so the brand page can
--     show a real average + count WITHOUT exposing who rated what (RLS keeps
--     individual rows visible only to their author).
--   • Backfill from existing reviews.rating_service (each member's most recent
--     per-brand service score) so no signal is lost.
--
-- The reviews.rating_service column is kept for history but is no longer
-- collected by the review form.
-- Re-runnable. Run after 0001.
-- ════════════════════════════════════════════════════════════════════

create table if not exists brand_service_ratings (
  user_id    uuid not null references profiles(id) on delete cascade,
  brand_id   uuid not null references brands(id)   on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, brand_id)
);

create index if not exists brand_service_ratings_brand_idx on brand_service_ratings(brand_id);

alter table brand_service_ratings enable row level security;

-- A member manages only their own brand ratings; the public aggregate is served
-- by the SECURITY DEFINER function below, never by reading these rows directly.
drop policy if exists "own service rating read"   on brand_service_ratings;
drop policy if exists "own service rating write"  on brand_service_ratings;
drop policy if exists "own service rating update" on brand_service_ratings;
drop policy if exists "own service rating delete" on brand_service_ratings;
create policy "own service rating read"   on brand_service_ratings for select using (user_id = auth.uid());
create policy "own service rating write"  on brand_service_ratings for insert with check (user_id = auth.uid());
create policy "own service rating update" on brand_service_ratings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own service rating delete" on brand_service_ratings for delete using (user_id = auth.uid());

-- Privacy-preserving aggregate: returns only avg + count per brand, bypassing
-- the own-row RLS above so the brand page can display the real score.
create or replace function public.brand_service_stats(ids uuid[])
returns table (brand_id uuid, avg numeric, count bigint)
language sql security definer stable set search_path = public as $$
  select brand_id, round(avg(rating)::numeric, 1) as avg, count(*) as count
  from brand_service_ratings
  where brand_id = any(ids)
  group by brand_id;
$$;

-- Backfill: seed brand ratings from each member's most recent per-brand review
-- that carried a customer-service score.
insert into brand_service_ratings (user_id, brand_id, rating, created_at, updated_at)
select distinct on (r.author_id, r.brand_id)
  r.author_id, r.brand_id, r.rating_service, r.created_at, now()
from reviews r
where r.brand_id is not null and r.rating_service is not null
order by r.author_id, r.brand_id, r.created_at desc
on conflict (user_id, brand_id) do nothing;
