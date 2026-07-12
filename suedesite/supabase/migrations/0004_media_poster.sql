-- ════════════════════════════════════════════════════════════════════
-- Suede — add a poster/preview image URL for video media.
-- Run this in the Supabase SQL editor after 0001–0003.
-- ════════════════════════════════════════════════════════════════════

alter table media add column if not exists poster_url text;
