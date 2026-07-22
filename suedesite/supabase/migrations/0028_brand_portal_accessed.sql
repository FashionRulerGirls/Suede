-- ════════════════════════════════════════════════════════════════════
-- 0028 — Track when a brand owner first accesses their portal
-- ════════════════════════════════════════════════════════════════════
-- Closes the loop for admins: approve → (manual) welcome email → owner logs in.
-- Stamped by the portal on first authenticated load; the admin dashboard shows
-- which approved brands have actually accessed their portal. The owner-edit RLS
-- policy already allows this write (the owner guard only protects owner_id /
-- status / is_capsule). Re-runnable.

alter table brands add column if not exists portal_accessed_at timestamptz;
