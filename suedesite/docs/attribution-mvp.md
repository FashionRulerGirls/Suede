# Attribution MVP — how Suede measures the interest (and purchases) it drives

Goal: prove Suede sends shoppers to brands, and — where the brand can confirm
it — that those visits become purchases. No embedded checkout, no PCI, no
Shopify/UCP dependency. First-party and honest by construction: we only ever log
a click the shopper actually made on Suede, and we tag the outbound link so the
brand can verify it in their own analytics.

## What a shopper sees
- **Brand page:** a "Shop <brand>" button (shown once the brand has a `shop_url`).
- **Review / inquiry detail:** the existing "View Product" button now goes to the
  actual product link when the review/inquiry has one.
- **Lookbook feed cards:** a "Shop ↗" link on review cards, and "View Product" on
  inquiry cards, when a product URL exists.

Each of these:
1. opens the brand's own site / the product page in a new tab,
2. adds `utm_source=suede&utm_medium=referral&utm_campaign=…&utm_content=…` so the
   brand sees Suede-sourced sessions **and orders** in their own Shopify/GA,
3. logs the click to `outbound_clicks` so Suede can report the traffic it drove.

Reviews/inquiries entered without a link simply don't show the link.

## What's honest about it (the Phia lesson)
Phia (Phoebe Gates' app) was suspended by Impact.com in July 2026 for
"cookie-stuffing" — a browser extension that opened background tabs at checkout
and overrode *other* affiliates' codes to claim credit for sales it didn't drive.
That's impossible here: Suede is a destination site, so there's no other
affiliate's cookie to override and no checkout page to inject into. The tracking
code enforces this — it only tags/logs a link the user clicked on Suede, only
accepts http(s) URLs, never uses background tabs, never overrides anything.

## Where the data lives
`outbound_clicks` (migration `0014`): `brand_id`, `brand_name`, `product_name`,
`target_url`, `member_id` (nullable), `source_page`, `created_at`.
RLS: anyone can insert a click; **only admins can read** (like `orders`).

Read the numbers in the Supabase SQL editor:

```sql
-- Suede-driven clicks per brand, last 30 days
select brand_name, count(*) as clicks
from outbound_clicks
where created_at > now() - interval '30 days'
group by brand_name
order by clicks desc;

-- clicks by surface (brand page vs review vs inquiry vs feed cards)
select source_page, count(*) from outbound_clicks group by source_page order by 2 desc;

-- most-clicked products
select brand_name, product_name, count(*) from outbound_clicks
where product_name is not null group by 1,2 order by 3 desc limit 25;
```

To confirm *purchases*: the brand reads their own analytics for `utm_source=suede`
sessions/orders, or (even simpler) give each brand a code like `SUEDE10` and count
redemptions.

## To turn it on
1. Run migration **`0014_outbound_clicks.sql`** in Supabase (required — it also
   adds `brands.shop_url`).
2. Set each brand's store address in `brands.shop_url` so the brand-page button
   appears (e.g. `update brands set shop_url = 'https://…' where slug = '…';`).
   Product-link buttons need nothing extra — they use the product URL saved on
   the review/inquiry.

## Pending migrations recap
- `0013_tier2_commerce.sql` — Tier 2 (embedded checkout) data models. **Optional /
  for later** — the embedded-checkout build is deferred; these tables are harmless
  to apply now but nothing uses them yet.
- `0014_outbound_clicks.sql` — **required** for this attribution MVP.

## Natural next steps (not built — need your eye)
- A small admin view of the click numbers (right now it's a SQL query).
- An admin field to set `brands.shop_url` from the UI instead of SQL.
- Per-brand referral codes for hard purchase confirmation.
