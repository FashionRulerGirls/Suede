# Suede — Backend Plan & Data Schema

Status: **Draft for review.** This is the blueprint for turning the current
front-end prototype (all data hardcoded in `lib/data.ts`, nothing persists)
into a real product. Nothing here is built yet — it's the map we build from.

---

## 1. Stack: Supabase

One managed service covers everything Suede needs, which keeps a small team fast:

| Need | Supabase piece |
|---|---|
| Accounts, sign-in, Google/Apple | **Auth** |
| All data (users, reviews, brands…) | **Postgres** database |
| Photos & videos on reviews, avatars | **Storage** (file buckets) |
| "Only the owner can edit this" rules | **Row-Level Security (RLS)** |
| Live notifications (optional) | **Realtime** |
| Suede Match, aggregate stats | Postgres **functions & views** |

You already created a project (URL `https://llkfvlkeayqhsujjjzuu.supabase.co`
+ anon key). We'll add these to the app as env vars:

```
NEXT_PUBLIC_SUPABASE_URL=...          # public, safe in the browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # public, safe in the browser
SUPABASE_SERVICE_ROLE_KEY=...         # SERVER ONLY — never ships to the browser
```

Client libraries: `@supabase/supabase-js` + `@supabase/ssr` (for Next.js App Router auth).

---

## 2. Auth model

- **Supabase Auth** handles email/password, plus Google & Apple OAuth (each needs
  dev credentials from the provider — a setup step, not code).
- Every auth user gets a matching row in **`profiles`** (1-to-1, same id). A trigger
  creates the profile automatically on sign-up.
- **Age gate (16+)** and the Terms/Privacy acceptance are recorded at sign-up.
- An **`is_admin`** flag on `profiles` (or a custom JWT claim) gates the admin dashboard.

---

## 3. The schema

Runnable Postgres DDL. `uuid` ids, `timestamptz` timestamps, snake_case columns.

### Identity & body

```sql
-- 1 row per member, keyed to the auth user
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  bio           text,
  avatar_url    text,
  instagram     text,
  tiktok        text,
  website       text,
  is_admin      boolean not null default false,
  -- account preferences (the toggles in Edit Profile → Account)
  measurements_public boolean not null default true,   -- Suede shows them unless hidden
  email_notifications boolean not null default true,
  show_in_collective  boolean not null default true,
  age_confirmed boolean not null default false,
  accepted_terms_at timestamptz,
  created_at    timestamptz not null default now()
);

-- 1 row per member. Numeric inches power Suede Match; text keeps the display value.
create table measurements (
  user_id       uuid primary key references profiles(id) on delete cascade,
  height_in     numeric,   -- e.g. 66  (5'6")
  bust_in       numeric,
  waist_in      numeric,
  hips_in       numeric,
  inseam_in     numeric,
  shoulder_in   numeric,
  arm_in        numeric,
  torso_in      numeric,
  usual_sizes   jsonb default '{}'::jsonb,  -- {tops_letter:"M", tops_num:"8", waist:"28", plus:null}
  updated_at    timestamptz not null default now()
);
```

### Brands

```sql
create table brands (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,            -- "kai-collective"
  name          text not null,
  tagline       text,
  founder       text,
  founded_year  text,
  category      text,          -- Womenswear, Unisex…
  location      text,
  social        text,          -- @kaicollective
  hero_image_url    text,      -- model cutout / hero
  is_capsule    boolean not null default false,  -- in The Capsule (vs. non-capsule mention)
  status        text not null default 'active',  -- active | outreach_pending | coming_soon
  owner_id      uuid references profiles(id),    -- brand-portal account, if claimed
  created_at    timestamptz not null default now()
);
```

### Reviews & inquiries

```sql
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references profiles(id) on delete cascade,
  brand_id      uuid references brands(id),      -- null allowed: non-capsule brand
  brand_name    text,                            -- free text when brand_id is null
  product_name  text not null,
  product_url   text,
  size_scale    text,   -- Letter | Numeric | Waist | Plus
  size_value    text,   -- M, 8, 28…
  size_other    text,
  rating_sizing   int check (rating_sizing between 1 and 5),
  rating_material int check (rating_material between 1 and 5),
  rating_value    int check (rating_value between 1 and 5),
  rating_photos   int check (rating_photos between 1 and 5),
  rating_service  int check (rating_service between 1 and 5),
  body          text not null,
  recommend     boolean,
  hide_measurements boolean not null default false,
  -- snapshot the reviewer's measurements at post time (so later edits don't rewrite history)
  measurements_snapshot jsonb,
  size_satisfaction jsonb,   -- {would_order:"L", tailoring:"no"} when sizing < 5
  status        text not null default 'published',  -- published | removed (moderation)
  created_at    timestamptz not null default now()
);

create table inquiries (
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

-- media for reviews and inquiries (photos/videos in Storage)
create table media (
  id            uuid primary key default gen_random_uuid(),
  parent_type   text not null,   -- 'review' | 'inquiry'
  parent_id     uuid not null,
  url           text not null,
  kind          text not null,   -- 'image' | 'video'
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
```

### Discussion & reactions

```sql
create table review_comments (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references reviews(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create table inquiry_responses (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid not null references inquiries(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- one "like/helpful" per user per thing (reviews, comments, responses)
create table reactions (
  user_id      uuid not null references profiles(id) on delete cascade,
  entity_type  text not null,   -- 'review' | 'review_comment' | 'inquiry_response'
  entity_id    uuid not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);
```

### Social graph

```sql
create table member_follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  followee_id  uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table brand_follows (
  user_id    uuid not null references profiles(id) on delete cascade,
  brand_id   uuid not null references brands(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, brand_id)
);
```

### Intake, quiz, notifications, newsletter

```sql
create table brand_applications (      -- from the Apply form
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

create table brand_suggestions (       -- from the Suggest a Brand form
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  url          text,
  why          text,
  status       text not null default 'new',  -- new | reviewed | added
  submitted_by uuid references profiles(id),
  created_at   timestamptz not null default now()
);

create table quiz_results (            -- AI Measurement Quiz
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,  -- null if anonymous
  answers    jsonb not null,
  derived    jsonb,   -- measurement estimates the quiz produced
  created_at timestamptz not null default now()
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,  -- recipient
  type        text not null,   -- review_on_followed_brand | new_follower | inquiry_response | match_review | comment
  actor_id    uuid references profiles(id),
  entity_type text,
  entity_id   uuid,
  data        jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);
```

---

## 4. Storage buckets

| Bucket | Public? | Holds |
|---|---|---|
| `avatars` | public read | profile photos |
| `review-media` | public read | review & inquiry photos/videos |
| `brand-assets` | public read | brand hero / model cutouts (incl. `akino.png`) |

Enforce the upload rules server-side (**≤5 photos, ≤2 videos, ≤60s** per review) and
only let a user write into their own folder (`review-media/{user_id}/...`).

---

## 5. Row-Level Security (the rules)

RLS is ON for every table. Summary of who can do what:

| Table | Read | Write |
|---|---|---|
| `profiles` | everyone | owner only |
| `measurements` | owner always; others **only via the Match function** (see §6) — never raw when hidden | owner only |
| `brands` | everyone | admin only (owner can edit their own brand's portal fields) |
| `reviews`, `inquiries`, `*_comments`, `*_responses` | everyone (status='published') | insert = signed-in author; edit/delete = author; remove = admin |
| `media` | everyone | author of the parent |
| `reactions`, `*_follows` | everyone (for counts) | the acting user |
| `brand_applications`, `brand_suggestions` | admin only | insert = anyone; status changes = admin |
| `quiz_results` | owner | owner |
| `notifications` | recipient only | system (service role) creates; recipient marks read |
| `newsletter_subscribers` | admin only | insert = anyone |

Example policy (reviews):

```sql
alter table reviews enable row level security;

create policy "reviews are public"
  on reviews for select using (status = 'published');

create policy "author inserts own review"
  on reviews for insert with check (auth.uid() = author_id);

create policy "author edits own review"
  on reviews for update using (auth.uid() = author_id);
```

---

## 6. Suede Match & aggregate stats (the interesting part)

**Suede Match must never leak raw hidden measurements.** So it's a
`security definer` function: it can read both people's numbers to compute a
score, but only returns a **confidence bucket** to callers who aren't the owner.

```sql
-- returns 0–100 similarity + 'high'|'medium'|'low' from measurement distance
create or replace function suede_match(viewer uuid, other uuid)
returns table (score int, confidence text)
language sql security definer stable as $$
  with a as (select * from measurements where user_id = viewer),
       b as (select * from measurements where user_id = other)
  select
    s.score,
    case when s.score >= 85 then 'high'
         when s.score >= 65 then 'medium'
         else 'low' end
  from (
    select greatest(0, 100 - round(
      ( abs(coalesce(a.bust_in,0)-coalesce(b.bust_in,0))
      + abs(coalesce(a.waist_in,0)-coalesce(b.waist_in,0))
      + abs(coalesce(a.hips_in,0)-coalesce(b.hips_in,0))
      + abs(coalesce(a.height_in,0)-coalesce(b.height_in,0)) ) * 2
    ))::int as score
    from a, b
  ) s;
$$;
```

*(The exact distance formula/weights are a product call — this is a sane
starting point. We can tune it once real data exists.)*

Brand stats (rating, review count, follower count) come from a **view** so
they're always accurate and never drift:

```sql
create view brand_stats as
select b.id,
       round(avg(r.rating_sizing)::numeric, 1)          as avg_rating,  -- or a blended score
       count(distinct r.id)                              as review_count,
       count(distinct i.id)                              as inquiry_count,
       count(distinct bf.user_id)                        as follower_count
from brands b
left join reviews r    on r.brand_id = b.id and r.status = 'published'
left join inquiries i  on i.brand_id = b.id
left join brand_follows bf on bf.brand_id = b.id
group by b.id;
```

---

## 7. How today's screens map to the schema

| Screen / form | Reads | Writes |
|---|---|---|
| The Capsule (brand grid) | `brands` + `brand_stats` | — |
| Brand page | `brands`, `brand_stats`, `reviews`, `inquiries` | `brand_follows` |
| The Lookbook | `reviews`, `inquiries` (+ `suede_match` per card) | — |
| The Collective | `profiles` (+ `suede_match`) | `member_follows` |
| Your / Member Profile | `profiles`, `measurements`, follows, feeds | — |
| Submit a Review | `brands` (search) | `reviews`, `media` |
| Submit an Inquiry | product fetch | `inquiries`, `media` |
| Review/Inquiry detail | that row + comments/responses | `review_comments` / `inquiry_responses`, `reactions` |
| Edit Profile | `profiles`, `measurements` | `profiles`, `measurements` |
| Quiz / Consultation | — | `quiz_results` → `measurements` |
| Apply | — | `brand_applications` |
| Suggest a Brand | — | `brand_suggestions` |
| Notifications | `notifications` | mark read |
| Newsletter (footer) | — | `newsletter_subscribers` |

---

## 8. What the admin dashboard needs (build it LAST)

Every admin action already has a home in the schema — the dashboard is thin CRUD on top:

- **Applications** → list `brand_applications`, approve (creates a `brands` row) / reject.
- **Suggestions** → list `brand_suggestions`, mark reviewed / added.
- **Capsule curation** → toggle `brands.is_capsule` / `brands.status`, edit brand fields, upload cutouts.
- **Moderation** → set `reviews.status`/`inquiries.status` = 'removed'; handle reports.
- **Members** → view profiles, flag/suspend.
- **Metrics** → counts from the views.

Access = `profiles.is_admin`. This is exactly why we do the schema first: the
dashboard becomes a couple days of UI over tables that already enforce the rules.

---

## 9. Rollout sequence

1. **Foundation** — create schema, RLS, storage buckets; seed `brands` from `lib/data.ts`; add Supabase client + env vars.
2. **Auth & profile** — email/password + Google/Apple; profile auto-create; wire Edit Profile + measurements to persist. Replace `setAuthed()` mock with real sessions.
3. **Reviews & inquiries** — write path + media upload + comments/responses + reactions; read The Lookbook/brand pages from DB.
4. **Social & match** — follows, feeds, `suede_match` on cards/collective.
5. **Intake & notifications** — Apply / Suggest / Quiz persist; notifications table + (optional) realtime.
6. **Admin dashboard.**
7. **Brand Portal** — decide: rebuild the static `/brand-portal` bundle inside the app with real auth, or keep it separate and bolt auth on.

Each step is shippable on its own; the app keeps working on mock data for anything not yet wired.

---

## 10. Open decisions (need your call)

1. **Minimum age** — Privacy/Terms currently say **16**. Keep it, or 13/18?
2. **Measurements input** — store canonical **inches** for matching; keep the letter/numeric size scales as "usual sizes." OK?
3. **Media limits** — enforce ≤5 photos / ≤2 videos / ≤60s server-side. Confirm.
4. **Brand Portal** — rebuild in-app, or keep the static bundle + add auth?
5. **Notifications** — live (Realtime) from day one, or simple on-load fetch first?
6. **OAuth** — do you want Google **and** Apple at launch? (Apple requires a paid Apple Developer account.)
7. **Moderation** — publish reviews instantly (post-moderate), or hold for approval? (Recommend post-moderate.)
8. **Match formula** — fine to launch with the simple distance above and tune later?

---

*Once you've answered §10, the natural next step is **Phase 1 (Foundation)**: I can
generate the actual migration SQL files and wire the Supabase client into the app.*
