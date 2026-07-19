-- ════════════════════════════════════════════════════════════════════
-- Suede — Admin dashboard Phase 3. Member emails live in auth.users, which the
-- browser client can't read. This SECURITY DEFINER function exposes the member
-- directory (with email) to ADMINS ONLY — the `where public.is_admin()` guard
-- means a non-admin caller simply gets zero rows. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
create or replace function public.admin_members()
returns table (id uuid, email text, username text, display_name text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, u.email::text, p.username, p.display_name, p.created_at
  from public.profiles p
  left join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc
$$;

grant execute on function public.admin_members() to authenticated;
