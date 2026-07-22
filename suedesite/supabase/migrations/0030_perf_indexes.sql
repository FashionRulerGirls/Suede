-- ════════════════════════════════════════════════════════════════════
-- 0030 — Performance indexes for the read-heavy paths
-- ════════════════════════════════════════════════════════════════════
-- The public feeds filter/sort on (status, created_at) and match brands by
-- name; comment/response loads filter by parent id; follower counts group by
-- brand. These indexes keep those queries fast as data grows. All safe /
-- re-runnable (create index if not exists).

-- Lookbook + brand-page feeds: where status=… order by created_at desc
create index if not exists reviews_status_created_idx   on reviews(status, created_at desc);
create index if not exists inquiries_status_created_idx on inquiries(status, created_at desc);

-- Brand pages match reviews/inquiries by brand_name (non-Capsule + fallback)
create index if not exists reviews_brand_name_idx   on reviews using gin (brand_name gin_trgm_ops);
create index if not exists inquiries_brand_name_idx on inquiries using gin (brand_name gin_trgm_ops);

-- Comment / response loads by parent
create index if not exists review_comments_review_idx     on review_comments(review_id, created_at desc);
create index if not exists inquiry_responses_inquiry_idx  on inquiry_responses(inquiry_id, created_at desc);

-- Follower counts group by brand
create index if not exists brand_follows_brand_idx on brand_follows(brand_id);

-- Outbound-click reporting groups by brand
create index if not exists outbound_clicks_brand_idx on outbound_clicks(brand_id);
