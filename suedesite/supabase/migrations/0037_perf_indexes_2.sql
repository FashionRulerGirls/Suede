-- ════════════════════════════════════════════════════════════════════
-- 0037 — Performance indexes (round 2): feed reactions, follower counts
-- ════════════════════════════════════════════════════════════════════
-- Hot read paths that were falling back to sequential scans:
--
--  • reactions: every review feed (Lookbook, brand, member, profile) tallies
--    likes with `where entity_type = 'review' and entity_id in (...)`. The PK
--    is (user_id, entity_type, entity_id) — leading column user_id — so it can't
--    serve this filter. Add an index leading with the columns actually filtered.
--
--  • member_follows: follower counts (`count(*) where followee_id = ?`) — on
--    member profiles and once per row in collective_members() — can't use the PK
--    (follower_id, followee_id) whose leading column is follower_id.
--
--  • brands.on_home: the home marquee filters `on_home = true`. Tiny table today,
--    but a partial index keeps it O(featured) as the catalog grows.
--
-- Re-runnable (create index if not exists). Run after 0001.
-- ════════════════════════════════════════════════════════════════════

create index if not exists reactions_entity_idx on reactions(entity_type, entity_id);

create index if not exists member_follows_followee_idx on member_follows(followee_id);

create index if not exists brands_on_home_idx on brands(on_home) where on_home;
