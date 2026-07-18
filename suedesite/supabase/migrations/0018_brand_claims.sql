-- ════════════════════════════════════════════════════════════════════
-- Suede — "Claim your brand" requests. A brand owner picks their brand and
-- submits proof (role, work email, socials). We flag whether their work-email
-- domain matches the brand's site (shop_url) as an easy-approve signal; the
-- rest are reviewed by hand in the admin dashboard. Approving a claim (setting
-- brands.owner_id) happens there, not here. Insert-open, admin-read — mirrors
-- feedback / outbound_clicks. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
create table if not exists brand_claims (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid references brands(id) on delete set null,
  brand_name    text not null,
  claimant_name text not null,
  role          text,
  work_email    text not null,
  instagram     text,
  note          text,
  domain_match  boolean not null default false, -- work_email domain == brand site domain
  status        text not null default 'pending', -- pending | approved | rejected
  user_id       uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references auth.users(id) on delete set null
);
create index if not exists brand_claims_brand_idx  on brand_claims(brand_id);
create index if not exists brand_claims_status_idx on brand_claims(status);

alter table brand_claims enable row level security;

-- Anyone can file a claim; only admins can read/triage them.
drop policy if exists brand_claims_insert on brand_claims;
drop policy if exists brand_claims_admin  on brand_claims;
create policy brand_claims_insert on brand_claims for insert with check (true);
create policy brand_claims_admin  on brand_claims for select using (public.is_admin());

grant insert on brand_claims to anon, authenticated;
grant select on brand_claims to authenticated; -- rows still gated to admins by RLS
