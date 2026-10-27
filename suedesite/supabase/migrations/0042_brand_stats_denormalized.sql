-- ════════════════════════════════════════════════════════════════════
-- 0042 — Denormalize brand stats onto `brands` (replace live aggregate)
-- ════════════════════════════════════════════════════════════════════
-- brand_stats is a view that recomputes avg_rating + review/inquiry/follower
-- counts across reviews ⋈ inquiries ⋈ brand_follows on every read, including on
-- the Capsule directory and Nav search (which pass every brand). This caches
-- those numbers on the brands row, maintained by triggers, so a brand list is a
-- single indexed scan instead of a full aggregate.
--
-- Counters are RECOMPUTED for the one affected brand on each write (cheap with
-- the existing brand_id indexes), which is always correct and far simpler than
-- incremental delta math across status/brand/rating changes.
--
-- The brand_stats view is kept for backward compatibility; the app prefers these
-- columns and falls back to the view if this migration hasn't run yet.
-- Re-runnable. Run after 0001.
-- ════════════════════════════════════════════════════════════════════

alter table brands add column if not exists cached_review_count   int     not null default 0;
alter table brands add column if not exists cached_inquiry_count  int     not null default 0;
alter table brands add column if not exists cached_follower_count int     not null default 0;
alter table brands add column if not exists cached_rating_sum     numeric not null default 0;
alter table brands add column if not exists cached_rating_n       int     not null default 0;

-- Recompute all cached counters for one brand from source (targeted + indexed).
create or replace function public.recompute_brand_cache(bid uuid)
returns void language sql security definer set search_path = public as $$
  update brands b set
    cached_review_count   = (select count(*)                       from reviews r       where r.brand_id = bid and r.status = 'published'),
    cached_rating_sum     = (select coalesce(sum(r.rating_sizing),0) from reviews r       where r.brand_id = bid and r.status = 'published' and r.rating_sizing is not null),
    cached_rating_n       = (select count(*)                       from reviews r       where r.brand_id = bid and r.status = 'published' and r.rating_sizing is not null),
    cached_inquiry_count  = (select count(*)                       from inquiries i     where i.brand_id = bid),
    cached_follower_count = (select count(*)                       from brand_follows f where f.brand_id = bid)
  where b.id = bid;
$$;

-- Triggers: recompute the affected brand(s) after any change to the sources.
create or replace function public.trg_reviews_brand_cache()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'DELETE') then
    if OLD.brand_id is not null then perform public.recompute_brand_cache(OLD.brand_id); end if;
    return OLD;
  end if;
  if NEW.brand_id is not null then perform public.recompute_brand_cache(NEW.brand_id); end if;
  if (TG_OP = 'UPDATE' and OLD.brand_id is distinct from NEW.brand_id and OLD.brand_id is not null) then
    perform public.recompute_brand_cache(OLD.brand_id);
  end if;
  return NEW;
end; $$;

create or replace function public.trg_inquiries_brand_cache()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'DELETE') then
    if OLD.brand_id is not null then perform public.recompute_brand_cache(OLD.brand_id); end if;
    return OLD;
  end if;
  if NEW.brand_id is not null then perform public.recompute_brand_cache(NEW.brand_id); end if;
  if (TG_OP = 'UPDATE' and OLD.brand_id is distinct from NEW.brand_id and OLD.brand_id is not null) then
    perform public.recompute_brand_cache(OLD.brand_id);
  end if;
  return NEW;
end; $$;

create or replace function public.trg_brand_follows_cache()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'DELETE') then
    if OLD.brand_id is not null then perform public.recompute_brand_cache(OLD.brand_id); end if;
    return OLD;
  end if;
  if NEW.brand_id is not null then perform public.recompute_brand_cache(NEW.brand_id); end if;
  return NEW;
end; $$;

drop trigger if exists reviews_brand_cache     on reviews;
drop trigger if exists inquiries_brand_cache   on inquiries;
drop trigger if exists brand_follows_cache     on brand_follows;
create trigger reviews_brand_cache   after insert or update or delete on reviews       for each row execute function public.trg_reviews_brand_cache();
create trigger inquiries_brand_cache after insert or update or delete on inquiries     for each row execute function public.trg_inquiries_brand_cache();
create trigger brand_follows_cache   after insert or update or delete on brand_follows for each row execute function public.trg_brand_follows_cache();

-- One-time backfill of every brand.
update brands b set
  cached_review_count   = coalesce((select count(*)                       from reviews r       where r.brand_id = b.id and r.status = 'published'), 0),
  cached_rating_sum     = coalesce((select sum(r.rating_sizing)            from reviews r       where r.brand_id = b.id and r.status = 'published' and r.rating_sizing is not null), 0),
  cached_rating_n       = coalesce((select count(*)                       from reviews r       where r.brand_id = b.id and r.status = 'published' and r.rating_sizing is not null), 0),
  cached_inquiry_count  = coalesce((select count(*)                       from inquiries i     where i.brand_id = b.id), 0),
  cached_follower_count = coalesce((select count(*)                       from brand_follows f where f.brand_id = b.id), 0);
