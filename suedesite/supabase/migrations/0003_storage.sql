-- ════════════════════════════════════════════════════════════════════
-- Suede — Storage buckets + policies.
-- (You can also create these in the dashboard → Storage; this keeps it in
--  version control.)
-- ════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('review-media', 'review-media', true),
       ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- Public read for all three buckets
drop policy if exists "suede public read" on storage.objects;
create policy "suede public read" on storage.objects
  for select using (bucket_id in ('avatars', 'review-media', 'brand-assets'));

-- Signed-in users may upload into avatars / review-media, but only inside a
-- folder named after their own user id  (e.g. review-media/{uid}/photo.jpg).
drop policy if exists "suede owner upload" on storage.objects;
create policy "suede owner upload" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('avatars', 'review-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "suede owner update" on storage.objects;
create policy "suede owner update" on storage.objects
  for update to authenticated using (
    bucket_id in ('avatars', 'review-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "suede owner delete" on storage.objects;
create policy "suede owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id in ('avatars', 'review-media')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- brand-assets are managed by admins/service role (no public write policy).
