-- ════════════════════════════════════════════════════════════════════
-- Suede — Row-Level Security. Nothing is readable/writable until a policy
-- allows it, so RLS is ON for every table with explicit policies below.
-- Re-runnable: each policy is dropped first.
-- ════════════════════════════════════════════════════════════════════

-- admin check (defined here, after profiles exists in 0001)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table profiles              enable row level security;
alter table measurements          enable row level security;
alter table brands                enable row level security;
alter table reviews               enable row level security;
alter table inquiries             enable row level security;
alter table media                 enable row level security;
alter table review_comments       enable row level security;
alter table inquiry_responses     enable row level security;
alter table reactions             enable row level security;
alter table moderation_flags      enable row level security;
alter table member_follows        enable row level security;
alter table brand_follows         enable row level security;
alter table brand_applications    enable row level security;
alter table brand_suggestions     enable row level security;
alter table quiz_results          enable row level security;
alter table notifications         enable row level security;
alter table newsletter_subscribers enable row level security;

-- ── PROFILES: public read, owner write ──────────────────────────────
drop policy if exists profiles_read   on profiles;
drop policy if exists profiles_update on profiles;
create policy profiles_read   on profiles for select using (true);
create policy profiles_update on profiles for update using (auth.uid() = id);

-- ── MEASUREMENTS: owner only. Everyone else gets numbers ONLY through
--    suede_match() (security definer). Raw rows are never exposed. ─────
drop policy if exists measurements_owner on measurements;
create policy measurements_owner on measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── BRANDS: public read; admin (or brand owner) write ───────────────
drop policy if exists brands_read   on brands;
drop policy if exists brands_write  on brands;
drop policy if exists brands_owner  on brands;
create policy brands_read  on brands for select using (true);
create policy brands_write on brands for all
  using (public.is_admin()) with check (public.is_admin());
create policy brands_owner on brands for update using (auth.uid() = owner_id);

-- ── REVIEWS / INQUIRIES: public read published; author writes; admin removes ─
drop policy if exists reviews_read   on reviews;
drop policy if exists reviews_insert on reviews;
drop policy if exists reviews_update on reviews;
drop policy if exists reviews_admin  on reviews;
create policy reviews_read   on reviews for select using (status = 'published' or auth.uid() = author_id or public.is_admin());
create policy reviews_insert on reviews for insert with check (auth.uid() = author_id);
create policy reviews_update on reviews for update using (auth.uid() = author_id);
create policy reviews_admin  on reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists inquiries_read   on inquiries;
drop policy if exists inquiries_insert on inquiries;
drop policy if exists inquiries_update on inquiries;
drop policy if exists inquiries_admin  on inquiries;
create policy inquiries_read   on inquiries for select using (status <> 'removed' or auth.uid() = author_id or public.is_admin());
create policy inquiries_insert on inquiries for insert with check (auth.uid() = author_id);
create policy inquiries_update on inquiries for update using (auth.uid() = author_id);
create policy inquiries_admin  on inquiries for all using (public.is_admin()) with check (public.is_admin());

-- ── MEDIA: public read; the author of the parent writes ─────────────
drop policy if exists media_read   on media;
drop policy if exists media_write  on media;
create policy media_read on media for select using (true);
create policy media_write on media for all using (
  auth.uid() = case parent_type
    when 'review'  then (select author_id from reviews   where id = parent_id)
    when 'inquiry' then (select author_id from inquiries where id = parent_id)
  end
);

-- ── COMMENTS / RESPONSES: public read; author writes ────────────────
drop policy if exists rc_read on review_comments;
drop policy if exists rc_write on review_comments;
create policy rc_read  on review_comments for select using (true);
create policy rc_write on review_comments for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists ir_read on inquiry_responses;
drop policy if exists ir_write on inquiry_responses;
create policy ir_read  on inquiry_responses for select using (true);
create policy ir_write on inquiry_responses for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- ── REACTIONS / FOLLOWS: public read (for counts); acting user writes ─
drop policy if exists reactions_read on reactions;
drop policy if exists reactions_write on reactions;
create policy reactions_read  on reactions for select using (true);
create policy reactions_write on reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists mf_read on member_follows;
drop policy if exists mf_write on member_follows;
create policy mf_read  on member_follows for select using (true);
create policy mf_write on member_follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

drop policy if exists bf_read on brand_follows;
drop policy if exists bf_write on brand_follows;
create policy bf_read  on brand_follows for select using (true);
create policy bf_write on brand_follows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── MODERATION: admin only (auto-flags are inserted by the service role,
--    which bypasses RLS; a signed-in user may file a report) ──────────
drop policy if exists mflag_admin  on moderation_flags;
drop policy if exists mflag_report on moderation_flags;
create policy mflag_admin  on moderation_flags for all using (public.is_admin()) with check (public.is_admin());
create policy mflag_report on moderation_flags for insert with check (auth.uid() = raised_by and source = 'user');

-- ── APPLICATIONS / SUGGESTIONS: anyone can submit; admin reads/updates ─
drop policy if exists app_insert on brand_applications;
drop policy if exists app_admin  on brand_applications;
create policy app_insert on brand_applications for insert with check (true);
create policy app_admin  on brand_applications for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists sug_insert on brand_suggestions;
drop policy if exists sug_admin  on brand_suggestions;
create policy sug_insert on brand_suggestions for insert with check (true);
create policy sug_admin  on brand_suggestions for all using (public.is_admin()) with check (public.is_admin());

-- ── QUIZ RESULTS: owner only ────────────────────────────────────────
drop policy if exists quiz_owner on quiz_results;
create policy quiz_owner on quiz_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── NOTIFICATIONS: recipient reads & marks read (service role creates) ─
drop policy if exists notif_read   on notifications;
drop policy if exists notif_update on notifications;
create policy notif_read   on notifications for select using (auth.uid() = user_id);
create policy notif_update on notifications for update using (auth.uid() = user_id);

-- ── NEWSLETTER: anyone can subscribe; admin reads ───────────────────
drop policy if exists news_insert on newsletter_subscribers;
drop policy if exists news_admin  on newsletter_subscribers;
create policy news_insert on newsletter_subscribers for insert with check (true);
create policy news_admin  on newsletter_subscribers for select using (public.is_admin());
