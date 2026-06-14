-- ============================================================
-- SUEDE — initial schema (v2 spec)
-- Run in Supabase: SQL Editor → paste → Run.
-- Confirmed tables (profiles/measurements/sizes/social_links) are exact to the
-- original backend; the rest are reconstructed from the design + team specs.
-- Postgres on Supabase. User identity is auth.users (uuid); app data keys off it.
-- ============================================================

-- (The is_admin() helper is defined after the tables exist — see below.)

-- ============================================================
-- MEMBER + ADMIN SCOPE
-- ============================================================

-- profiles (was `users`) — keyed to auth.users [confirmed fields]
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text, last_name text, user_name text unique, display_name text,
  phone text, email text, bio text, avatar text, cover_image_url text,
  role text not null default 'member',            -- member | admin
  profile_type text,                              -- shopper | creator_stylist | brand_founder | investor
  status text not null default 'active',
  unit_preference text default 'in',              -- in | cm
  last_login_at timestamptz,
  profile_completed boolean not null default false,
  review_started_at timestamptz,
  inquiry_started_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- measurements [confirmed + intake fields]
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  height_feet int, height_inches int,
  bust_inches numeric, waist_inches numeric, hips_inches numeric,
  shoulder_inches numeric, inseam_inches numeric, arm_length_inches numeric,
  weight_lbs numeric,
  measurement_date date, measurements_completed_at timestamptz,
  source text,                                    -- quick_fit | self_guided | manual
  match_confidence text,                          -- high | medium | low (quick_fit only)
  confidence_weight numeric,                      -- Suede Match score penalty (0 for measured sources)
  is_verified boolean not null default false,
  verified_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

-- sizes [confirmed]
create table public.sizes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tops_letter_sizes jsonb, tops_numeric_sizes jsonb,
  bottoms_letter_sizes jsonb, bottoms_numeric_sizes jsonb, bottoms_waist_sizes jsonb,
  dresses_sizes jsonb, plus_sizes jsonb,
  body_build text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

-- social_links [confirmed: instagram, tiktok]
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  instagram text, tiktok text,
  unique (user_id)
);

create table public.style_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  preferences jsonb,
  unique (user_id)
);

-- ============================================================
-- BRANDS + BRAND PORTAL (separate auth scope)
-- ============================================================

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique not null,
  short_bio text, extended_bio text,
  founder_name text, founder_story text,
  logo_url text, banner_image_url text, size_chart_url text,
  website_url text, country_of_origin text, founded_year int,
  instagram text, tiktok text, pinterest text,
  suede_code text,
  returns_policy text, shipping_policy text, sustainability_statement text,
  is_minority_owned boolean default false,
  brand_type text default 'non_capsule',          -- capsule | non_capsule
  drop_number text,                               -- 'Drop 00', 'Drop 01' ... capsule only
  status text default 'pending',                  -- pending | approved | rejected
  claimed_at timestamptz,
  rating_avg numeric default 0, sizing_accuracy_avg numeric default 0,
  recommend_pct numeric default 0,
  review_count int default 0, inquiry_count int default 0, follower_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.brand_accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  email text not null, password_hash text,
  status text default 'invited',                  -- invited | active | disabled
  created_at timestamptz default now()
);

create table public.brand_invites (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  email text not null, token text unique not null,
  expires_at timestamptz, accepted_at timestamptz,
  created_at timestamptz default now()
);

create table public.brand_applications (
  id uuid primary key default gen_random_uuid(),
  brand_name text, website_url text, founding_year int,
  ownership_identity text, slow_fashion_practices text, contact_email text,
  status text default 'submitted',                -- submitted | approved | denied
  created_at timestamptz default now()
);

-- ============================================================
-- CATALOG + COMMUNITY
-- ============================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  name text not null, slug text unique not null, description text,
  category text, price numeric, size_range text, images jsonb,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  brand_id uuid references public.brands(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text, size_purchased text,
  category text,                                  -- Tops|Bottoms|Dresses|Outerwear (required)
  rating_overall numeric,
  sizing_accuracy numeric, material_quality numeric, value_for_price numeric,
  true_to_photos numeric, customer_service numeric,
  fit_signal text,                                -- runs_small | true_to_size | runs_large
  recommends boolean,
  body_text text, photos jsonb,
  helpful_count int default 0, comment_count int default 0,
  is_flagged boolean default false,
  status text default 'published',                -- published | unpublished | pending
  created_at timestamptz default now()
);

create table public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete cascade,
  brand_account_id uuid references public.brand_accounts(id),
  body text, edited_at timestamptz, created_at timestamptz default now()
);

create table public.review_flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete cascade,
  flagged_by_brand uuid references public.brand_accounts(id),
  reason text,                                    -- inaccurate_info | spam | not_genuine | abusive
  status text default 'pending',                  -- pending | upheld | denied
  created_at timestamptz default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  brand_id uuid references public.brands(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text, question_text text,
  category text,
  helpful_votes int default 0,
  reply_count int default 0, is_flagged boolean default false,
  status text default 'open', created_at timestamptz default now()
);

create table public.inquiry_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (inquiry_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  parent_type text, parent_id uuid, body text,
  is_official_review boolean default false,
  created_at timestamptz default now()
);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade,
  followable_type text, followable_id uuid,
  created_at timestamptz default now(),
  unique (follower_id, followable_type, followable_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text, actor_id uuid, message text, read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- INBOUND / ADMIN QUEUES
-- ============================================================

create table public.brand_suggestions (
  id uuid primary key default gen_random_uuid(),
  brand_name text, website_url text, reason text,
  suggested_by uuid references public.profiles(id),
  status text default 'pending',
  created_at timestamptz default now()
);

create table public.brand_contact_requests (
  id uuid primary key default gen_random_uuid(),
  kind text,                                      -- capsule_owner | general
  brand_id uuid references public.brands(id),
  brand_name text, contact_name text, email text, message text,
  status text default 'new',
  created_at timestamptz default now()
);

create table public.platform_feedback (
  id uuid primary key default gen_random_uuid(),
  member_handle text, body text, status text default 'new',
  created_at timestamptz default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null, created_at timestamptz default now()
);

-- ============================================================
-- AFFILIATE INFRASTRUCTURE
-- ============================================================

create table public.affiliate_programs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id),
  network text, affiliate_tag text, status text, commission_rate numeric,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.product_links (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id),
  brand_id uuid references public.brands(id),
  raw_url text, normalized_url text,
  suede_redirect_id text unique,
  affiliate_eligible boolean,
  created_at timestamptz default now()
);

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_link_id uuid references public.product_links(id),
  review_id uuid references public.reviews(id),
  clicked_by uuid references public.profiles(id),
  session_id text, ip_hash text, affiliate_tag_used text,
  clicked_at timestamptz default now()
);

create table public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_click_id uuid references public.affiliate_clicks(id),
  brand_id uuid references public.brands(id),
  order_value numeric, commission_earned numeric,
  conversion_at timestamptz, network text, raw_payload jsonb
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- helper: true if the current user is an admin (defined now that profiles exists)
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles            enable row level security;
alter table public.measurements        enable row level security;
alter table public.sizes               enable row level security;
alter table public.social_links        enable row level security;
alter table public.style_preferences   enable row level security;
alter table public.brands              enable row level security;
alter table public.brand_accounts      enable row level security;
alter table public.brand_invites       enable row level security;
alter table public.brand_applications  enable row level security;
alter table public.products            enable row level security;
alter table public.reviews             enable row level security;
alter table public.review_replies      enable row level security;
alter table public.review_flags        enable row level security;
alter table public.inquiries           enable row level security;
alter table public.inquiry_helpful_votes enable row level security;
alter table public.comments            enable row level security;
alter table public.follows             enable row level security;
alter table public.notifications       enable row level security;
alter table public.brand_suggestions   enable row level security;
alter table public.brand_contact_requests enable row level security;
alter table public.platform_feedback   enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.affiliate_programs  enable row level security;
alter table public.product_links       enable row level security;
alter table public.affiliate_clicks    enable row level security;
alter table public.affiliate_conversions enable row level security;

-- profiles: any logged-in member can read (Collective); write only your own.
create policy "profiles_read_auth" on public.profiles for select to authenticated using (true);
create policy "profiles_write_own" on public.profiles for update to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());

-- measurements/sizes: readable by logged-in members (badges on cards); written only by owner.
create policy "measurements_read_auth" on public.measurements for select to authenticated using (true);
create policy "measurements_cud_own" on public.measurements for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sizes_read_auth" on public.sizes for select to authenticated using (true);
create policy "sizes_cud_own" on public.sizes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "social_read_auth" on public.social_links for select to authenticated using (true);
create policy "social_cud_own" on public.social_links for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "stylepref_cud_own" on public.style_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- brands/products: public read (directory). Writes admin-only for now.
create policy "brands_read_all" on public.brands for select using (true);
create policy "brands_admin_write" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_read_all" on public.products for select using (true);
create policy "products_admin_write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reviews/inquiries/comments: public read of published; members create their own.
create policy "reviews_read_published" on public.reviews for select using (status = 'published' or user_id = auth.uid());
create policy "reviews_insert_own" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "reviews_update_own" on public.reviews for update to authenticated using (user_id = auth.uid());
create policy "inquiries_read_all" on public.inquiries for select using (true);
create policy "inquiries_insert_own" on public.inquiries for insert to authenticated with check (user_id = auth.uid());
create policy "comments_read_all" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated with check (user_id = auth.uid());

-- helpful votes / follows / notifications: owner-scoped.
create policy "votes_own" on public.inquiry_helpful_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "follows_own" on public.follows for all to authenticated using (follower_id = auth.uid()) with check (follower_id = auth.uid());
create policy "notifications_own" on public.notifications for select to authenticated using (user_id = auth.uid());

-- public-submittable forms.
create policy "applications_insert_any" on public.brand_applications for insert with check (true);
create policy "applications_admin_read" on public.brand_applications for select to authenticated using (public.is_admin());
create policy "suggestions_insert_auth" on public.brand_suggestions for insert to authenticated with check (true);
create policy "suggestions_admin_read" on public.brand_suggestions for select to authenticated using (public.is_admin());
create policy "contact_insert_any" on public.brand_contact_requests for insert with check (true);
create policy "contact_admin_read" on public.brand_contact_requests for select to authenticated using (public.is_admin());
create policy "feedback_insert_any" on public.platform_feedback for insert with check (true);
create policy "feedback_admin_read" on public.platform_feedback for select to authenticated using (public.is_admin());
create policy "newsletter_insert_any" on public.newsletter_subscribers for insert with check (true);

-- brand portal + affiliate internals: no anon/member access.
-- (managed via service-role/admin only; conversions are commission data and stay locked.)
create policy "conversions_admin_read" on public.affiliate_conversions for select to authenticated using (public.is_admin());
create policy "programs_admin" on public.affiliate_programs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "links_read_all" on public.product_links for select using (true);

-- ============================================================
-- SEED: make yourself admin after signing up
--   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
-- ============================================================
