-- ════════════════════════════════════════════════════════════════════
-- Suede — Tier 2 on-site checkout: Suede-side data models (spec §7).
-- Products carry only Suede's own record (live Shopify data is fetched and
-- joined at read time, never duplicated). Orders + commission ledger are
-- admin-read only — members never see them — and are written server-side
-- (service role) from the order webhook, so no member/anon write policies.
-- Commission `rate` is captured per order at order time so later rate changes
-- never rewrite history. Table names are plural to match existing schema;
-- `order` is also a reserved word. Re-runnable.
-- ════════════════════════════════════════════════════════════════════

-- ── PRODUCTS: Suede's record; Shopify catalog data joined live at read time ──
create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid not null references brands(id) on delete cascade,
  shopify_product_ref text,                    -- external id to fetch live catalog data
  slug                text,
  created_at          timestamptz not null default now()
);
create index if not exists products_brand_idx on products(brand_id);
create unique index if not exists products_shopify_ref_idx on products(shopify_product_ref)
  where shopify_product_ref is not null;

-- ── ORDERS: one row per Suede-driven order (attribution key = shopify_order_id) ─
create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  shopify_order_id      text unique not null,  -- deterministic attribution key
  brand_id              uuid not null references brands(id),
  member_id             uuid references profiles(id) on delete set null,
  gross_amount          numeric,               -- order total as reported by the business
  currency              text,
  status                text not null,         -- paid | refunded | cancelled | fulfilled | delivered
  placed_at             timestamptz,
  return_window_ends_at  timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists orders_brand_idx on orders(brand_id);
create index if not exists orders_member_idx on orders(member_id);

-- ── COMMISSION LEDGER: one row per order; rate frozen at order time ──────────
create table if not exists commission_ledger (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null unique references orders(id) on delete cascade,
  brand_id          uuid not null references brands(id),
  eligible_base     numeric,                   -- net of tax, shipping, refunds
  rate              numeric,                   -- from the brand agreement at order time
  commission_amount numeric,                   -- eligible_base * rate
  state             text not null default 'pending', -- pending | payable | invoiced | paid | reversed
  computed_at       timestamptz,
  updated_at        timestamptz not null default now()
);
create index if not exists ledger_state_idx on commission_ledger(state);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table products          enable row level security;
alter table orders            enable row level security;
alter table commission_ledger enable row level security;

-- Products: public read (catalog join data is not sensitive); admin writes.
drop policy if exists products_read  on products;
drop policy if exists products_write on products;
create policy products_read  on products for select using (true);
create policy products_write on products for all
  using (public.is_admin()) with check (public.is_admin());

-- Orders & ledger: admin-read only. No insert/update/delete policies, so only
-- the service role (which bypasses RLS, used by the webhook receiver) can write;
-- members and anon can neither read nor write.
drop policy if exists orders_admin_read on orders;
create policy orders_admin_read on orders for select using (public.is_admin());

drop policy if exists ledger_admin_read on commission_ledger;
create policy ledger_admin_read on commission_ledger for select using (public.is_admin());
