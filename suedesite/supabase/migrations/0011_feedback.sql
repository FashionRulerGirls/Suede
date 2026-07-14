-- ════════════════════════════════════════════════════════════════════
-- Suede — Product feedback / improvement suggestions (footer mini-form).
-- Anyone (guest or member) can submit; only admins can read. Mirrors the
-- newsletter_subscribers insert-open / admin-read pattern. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  message    text not null,
  email      text,
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

drop policy if exists feedback_insert on feedback;
drop policy if exists feedback_admin  on feedback;
create policy feedback_insert on feedback for insert with check (true);
create policy feedback_admin  on feedback for select using (public.is_admin());

grant insert on feedback to anon, authenticated;
grant select on feedback to authenticated; -- rows still gated to admins by RLS
