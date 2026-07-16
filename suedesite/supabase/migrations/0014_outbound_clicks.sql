-- ════════════════════════════════════════════════════════════════════
-- Suede — Outbound click tracking (attribution MVP).
-- Records a click when a shopper taps "Shop at <brand>" and heads to the
-- brand's site. First-party and honest by construction: we only ever log a
-- click the user actually made on Suede — no last-click override, no
-- background tabs, no touching another retailer's checkout. This is what
-- measures "Suede drove interest" (and, via utm tags on the link, lets the
-- brand see Suede-sourced sessions/orders in their own analytics).
-- Admin-read only, like orders. Re-runnable.
-- ════════════════════════════════════════════════════════════════════

-- brands need a destination to send shoppers to
alter table brands add column if not exists shop_url text;

create table if not exists outbound_clicks (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid references brands(id) on delete set null,
  brand_name   text,
  product_name text,
  target_url   text not null,
  member_id    uuid references profiles(id) on delete set null,
  source_page  text,          -- where on Suede the click happened (brand | review | lookbook | …)
  created_at   timestamptz not null default now()
);
create index if not exists outbound_clicks_brand_idx on outbound_clicks(brand_id);
create index if not exists outbound_clicks_created_idx on outbound_clicks(created_at);

alter table outbound_clicks enable row level security;

-- Anyone (guest or member) can log a click; only admins can read the analytics.
drop policy if exists outbound_clicks_insert on outbound_clicks;
drop policy if exists outbound_clicks_admin  on outbound_clicks;
create policy outbound_clicks_insert on outbound_clicks for insert with check (true);
create policy outbound_clicks_admin  on outbound_clicks for select using (public.is_admin());

grant insert on outbound_clicks to anon, authenticated;
grant select on outbound_clicks to authenticated; -- rows still gated to admins by RLS
