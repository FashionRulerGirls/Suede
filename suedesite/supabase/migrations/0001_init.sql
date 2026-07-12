-- ════════════════════════════════════════════════════════════════════
-- Suede — Phase 1 Foundation schema
-- Generated from docs/BACKEND_PLAN.md. Apply in the Supabase SQL editor
-- (or `supabase db push`). Safe to re-run: guarded with IF NOT EXISTS /
-- CREATE OR REPLACE where possible.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;     -- fuzzy brand-name matching

-- ════════════════════════════════════════════════════════════════════
-- IDENTITY & BODY
-- ════════════════════════════════════════════════════════════════════
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  bio           text,
  avatar_url    text,
  instagram     text,
  tiktok        text,
  website       text,
  is_admin      boolean not null default false,
  measurements_public boolean not null default true,
  email_notifications boolean not null default true,
  show_in_collective  boolean not null default true,
  accepted_terms_at timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists measurements (
  user_id       uuid primary key references profiles(id) on delete cascade,
  height_in     numeric,
  bust_in       numeric,
  waist_in      numeric,
  hips_in       numeric,
  inseam_in     numeric,
  shoulder_in   numeric,
  arm_in        numeric,
  torso_in      numeric,
  usual_sizes   jsonb not null default '{}'::jsonb,
  source        text,                 -- 'tape' | 'quiz' | 'manual'
  source_confidence numeric,          -- 0–1
  updated_at    timestamptz not null default now()
);

-- create a profile row automatically on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare base_username text;
begin
  base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    -- keep usernames unique; onboarding lets the user pick a real one
    base_username || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'display_name', base_username)
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════
-- BRANDS
-- ════════════════════════════════════════════════════════════════════
create table if not exists brands (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  tagline       text,
  founder       text,
  founded_year  text,
  category      text,
  location      text,
  social        text,
  hero_image_url text,
  is_capsule    boolean not null default false,
  status        text not null default 'active',   -- active | outreach_pending | coming_soon
  owner_id      uuid references profiles(id),
  created_at    timestamptz not null default now()
);
create index if not exists brands_name_trgm on brands using gin (name gin_trgm_ops);

-- ════════════════════════════════════════════════════════════════════
-- REVIEWS & INQUIRIES
-- ════════════════════════════════════════════════════════════════════
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references profiles(id) on delete cascade,
  brand_id      uuid references brands(id),
  brand_name    text,
  product_name  text not null,
  product_url   text,
  size_scale    text,
  size_value    text,
  size_other    text,
  rating_sizing   int check (rating_sizing between 1 and 5),
  rating_material int check (rating_material between 1 and 5),
  rating_value    int check (rating_value between 1 and 5),
  rating_photos   int check (rating_photos between 1 and 5),
  rating_service  int check (rating_service between 1 and 5),
  body          text not null,
  recommend     boolean,
  hide_measurements boolean not null default false,
  measurements_snapshot jsonb,
  size_satisfaction jsonb,
  status        text not null default 'published',  -- published | removed
  created_at    timestamptz not null default now()
);
create index if not exists reviews_brand_idx  on reviews(brand_id);
create index if not exists reviews_author_idx on reviews(author_id);

create table if not exists inquiries (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references profiles(id) on delete cascade,
  brand_id      uuid references brands(id),
  brand_name    text,
  product_name  text not null,
  product_url   text,
  category      text,
  size_scale    text,
  size_value    text,
  size_other    text,
  body          text not null,
  measurements_snapshot jsonb,
  status        text not null default 'open',  -- open | answered | removed
  created_at    timestamptz not null default now()
);
create index if not exists inquiries_brand_idx  on inquiries(brand_id);
create index if not exists inquiries_author_idx on inquiries(author_id);

create table if not exists media (
  id            uuid primary key default gen_random_uuid(),
  parent_type   text not null,   -- 'review' | 'inquiry'
  parent_id     uuid not null,
  url           text not null,
  kind          text not null,   -- 'image' | 'video'
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists media_parent_idx on media(parent_type, parent_id);

-- ════════════════════════════════════════════════════════════════════
-- DISCUSSION & REACTIONS
-- ════════════════════════════════════════════════════════════════════
create table if not exists review_comments (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references reviews(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create table if not exists inquiry_responses (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid not null references inquiries(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists reactions (
  user_id      uuid not null references profiles(id) on delete cascade,
  entity_type  text not null,   -- 'review' | 'review_comment' | 'inquiry_response'
  entity_id    uuid not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);

-- ════════════════════════════════════════════════════════════════════
-- MODERATION (instant-publish + auto-flag)
-- ════════════════════════════════════════════════════════════════════
create table if not exists moderation_flags (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id   uuid not null,
  reason      text not null,
  source      text not null default 'auto',   -- 'auto' | 'user'
  detail      jsonb,
  status      text not null default 'open',    -- open | resolved | dismissed
  raised_by   uuid references profiles(id),
  resolved_by uuid references profiles(id),
  created_at  timestamptz not null default now()
);
create index if not exists moderation_open_idx on moderation_flags(status) where status = 'open';

-- ════════════════════════════════════════════════════════════════════
-- SOCIAL GRAPH
-- ════════════════════════════════════════════════════════════════════
create table if not exists member_follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  followee_id  uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table if not exists brand_follows (
  user_id    uuid not null references profiles(id) on delete cascade,
  brand_id   uuid not null references brands(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, brand_id)
);

-- ════════════════════════════════════════════════════════════════════
-- INTAKE, QUIZ, NOTIFICATIONS, NEWSLETTER
-- ════════════════════════════════════════════════════════════════════
create table if not exists brand_applications (
  id           uuid primary key default gen_random_uuid(),
  brand_name   text not null,
  website      text,
  email        text not null,
  location     text,
  ownership    text,
  ownership_other text,
  founding_year text,
  pitch        text,
  status       text not null default 'pending',  -- pending | approved | rejected
  submitted_by uuid references profiles(id),
  reviewed_by  uuid references profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists brand_suggestions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  url          text,
  why          text,
  status       text not null default 'new',   -- new | reviewed | added
  submitted_by uuid references profiles(id),
  created_at   timestamptz not null default now()
);

create table if not exists quiz_results (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  answers    jsonb not null,
  derived    jsonb,
  confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,
  actor_id    uuid references profiles(id),
  entity_type text,
  entity_id   uuid,
  data        jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
-- SUEDE MATCH  (proximity + source-weighted confidence; never leaks numbers)
-- ════════════════════════════════════════════════════════════════════
create or replace function public.suede_match(viewer uuid, other uuid)
returns table (score int, confidence text)
language sql security definer stable set search_path = public as $$
  with a as (select * from measurements where user_id = viewer),
       b as (select * from measurements where user_id = other),
  prox as (
    select greatest(0, 100 - round(
      ( abs(coalesce(a.bust_in,0)-coalesce(b.bust_in,0))
      + abs(coalesce(a.waist_in,0)-coalesce(b.waist_in,0))
      + abs(coalesce(a.hips_in,0)-coalesce(b.hips_in,0))
      + abs(coalesce(a.height_in,0)-coalesce(b.height_in,0)) ) * 2
    ))::int as score
    from a, b
  ),
  conf as (
    select least(coalesce(a.source_confidence, 0.9),
                 coalesce(b.source_confidence, 0.9)) as w
    from a, b
  )
  select p.score,
         case when p.score * c.w >= 85 then 'high'
              when p.score * c.w >= 65 then 'medium'
              else 'low' end
  from prox p, conf c;
$$;

-- ════════════════════════════════════════════════════════════════════
-- BRAND STATS  (always-accurate aggregates)
-- ════════════════════════════════════════════════════════════════════
create or replace view brand_stats as
select b.id,
       round(avg(r.rating_sizing)::numeric, 1)  as avg_rating,
       count(distinct r.id)                      as review_count,
       count(distinct i.id)                      as inquiry_count,
       count(distinct bf.user_id)                as follower_count
from brands b
left join reviews r    on r.brand_id = b.id and r.status = 'published'
left join inquiries i  on i.brand_id = b.id
left join brand_follows bf on bf.brand_id = b.id
group by b.id;
