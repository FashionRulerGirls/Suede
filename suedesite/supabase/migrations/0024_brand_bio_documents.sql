-- ════════════════════════════════════════════════════════════════════
-- Suede — Brand portal: a long-form bio (shown on the back of the brand card,
-- distinct from the short tagline) and uploadable brand documents (size guide,
-- policies, lookbook, verification, etc.). Files live in the brand-assets
-- bucket; this table records them. Owner- (or admin-) managed. Re-runnable.
-- ════════════════════════════════════════════════════════════════════
alter table brands add column if not exists long_bio text;

create table if not exists brand_documents (
  id         uuid primary key default gen_random_uuid(),
  brand_id   uuid not null references brands(id) on delete cascade,
  label      text not null,
  url        text not null,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists brand_documents_brand_idx on brand_documents(brand_id);

alter table brand_documents enable row level security;

-- Public can read a brand's documents; the brand's owner (or an admin) manages.
drop policy if exists brand_docs_read  on brand_documents;
drop policy if exists brand_docs_write on brand_documents;
create policy brand_docs_read on brand_documents for select using (true);
create policy brand_docs_write on brand_documents for all
  using (public.is_admin() or exists (select 1 from public.brands b where b.id = brand_id and b.owner_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.brands b where b.id = brand_id and b.owner_id = auth.uid()));

grant select on brand_documents to anon, authenticated;
grant insert, update, delete on brand_documents to authenticated; -- gated by policy

-- Let a signed-in brand owner upload into the public brand-assets bucket, but
-- only inside a folder named after their own user id (mirrors the avatars /
-- review-media owner-folder policies).
drop policy if exists "brand owner asset upload" on storage.objects;
drop policy if exists "brand owner asset update" on storage.objects;
drop policy if exists "brand owner asset delete" on storage.objects;
create policy "brand owner asset upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "brand owner asset update" on storage.objects for update to authenticated
  using (bucket_id = 'brand-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "brand owner asset delete" on storage.objects for delete to authenticated
  using (bucket_id = 'brand-assets' and (storage.foldername(name))[1] = auth.uid()::text);
