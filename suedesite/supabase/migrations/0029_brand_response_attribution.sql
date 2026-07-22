-- ════════════════════════════════════════════════════════════════════
-- 0029 — Attribute brand-owner responses to the brand
-- ════════════════════════════════════════════════════════════════════
-- When a brand owner replies to a review/inquiry from the portal, tag the reply
-- with their brand so it can render as "<name> on behalf of <Brand>". Nullable:
-- ordinary member replies leave it null. The write policies are tightened so a
-- reply can only be attributed to a brand the author actually owns (no faking
-- an official brand response). Re-runnable.

alter table review_comments   add column if not exists brand_id uuid references brands(id) on delete set null;
alter table inquiry_responses add column if not exists brand_id uuid references brands(id) on delete set null;

drop policy if exists rc_write on review_comments;
create policy rc_write on review_comments for all
  using (auth.uid() = author_id)
  with check (
    auth.uid() = author_id
    and (brand_id is null or exists (select 1 from public.brands b where b.id = brand_id and b.owner_id = auth.uid()))
  );

drop policy if exists ir_write on inquiry_responses;
create policy ir_write on inquiry_responses for all
  using (auth.uid() = author_id)
  with check (
    auth.uid() = author_id
    and (brand_id is null or exists (select 1 from public.brands b where b.id = brand_id and b.owner_id = auth.uid()))
  );
