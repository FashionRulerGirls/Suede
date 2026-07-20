-- ════════════════════════════════════════════════════════════════════
-- 0026 — Admin can read measurements (dashboard aggregates)
-- ════════════════════════════════════════════════════════════════════
-- measurements RLS is owner-only (auth.uid() = user_id). The admin dashboard
-- reads the table across all members to compute profile completeness and the
-- profile-source breakdown (consultation / quiz / self-input) — without an
-- admin read policy the admin only sees their own row, so those figures are
-- wrong. Add an admin-only SELECT policy (permissive, OR-ed with the owner
-- policy). Gated by is_admin(), so non-admins are unaffected. Re-runnable.

drop policy if exists measurements_admin_read on measurements;
create policy measurements_admin_read on measurements for select using (public.is_admin());
