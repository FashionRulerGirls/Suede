-- ════════════════════════════════════════════════════════════════════
-- Suede — Admin dashboard Phase 2. Give platform feedback a triage status so
-- the admin can mark items reviewed, and let admins write that status (feedback
-- was insert-open / admin-read only). Re-runnable.
-- ════════════════════════════════════════════════════════════════════
alter table feedback add column if not exists status text not null default 'new'; -- new | reviewed
alter table feedback add column if not exists reviewed_at timestamptz;

drop policy if exists feedback_admin_write on feedback;
create policy feedback_admin_write on feedback for update using (public.is_admin()) with check (public.is_admin());

grant update on feedback to authenticated; -- still gated to admins by the policy
