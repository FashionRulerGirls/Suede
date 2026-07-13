-- ════════════════════════════════════════════════════════════════════
-- Suede — generate in-app notifications from member activity.
--
-- The notifications table is written by service/trigger code only (members
-- can read & mark-read their own rows via RLS, per 0002). These security-
-- definer triggers insert a notification for the RECIPIENT whenever another
-- member acts on their content: a follow, a comment on their review, a
-- response to their inquiry, or a like on any of the three.
--
-- Notifications never fire for acting on your own content. Run after 0001–0005.
-- ════════════════════════════════════════════════════════════════════

-- ── new follower ─────────────────────────────────────────────────────
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, type, actor_id, entity_type, entity_id)
  values (new.followee_id, 'follow', new.follower_id, 'member', new.follower_id);
  return new;
end $$;

drop trigger if exists trg_notify_follow on member_follows;
create trigger trg_notify_follow
  after insert on member_follows
  for each row execute function public.notify_on_follow();

-- ── comment on your review ───────────────────────────────────────────
create or replace function public.notify_on_review_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid; pname text; bname text;
begin
  select author_id, product_name, coalesce(brand_name, '')
    into owner, pname, bname
    from reviews where id = new.review_id;
  if owner is not null and owner <> new.author_id then
    insert into notifications (user_id, type, actor_id, entity_type, entity_id, data)
    values (owner, 'review_comment', new.author_id, 'review', new.review_id,
            jsonb_build_object('product', pname, 'brand', bname, 'body', left(new.body, 140)));
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_review_comment on review_comments;
create trigger trg_notify_review_comment
  after insert on review_comments
  for each row execute function public.notify_on_review_comment();

-- ── response to your inquiry ─────────────────────────────────────────
create or replace function public.notify_on_inquiry_response()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid; pname text; bname text;
begin
  select author_id, product_name, coalesce(brand_name, '')
    into owner, pname, bname
    from inquiries where id = new.inquiry_id;
  if owner is not null and owner <> new.author_id then
    insert into notifications (user_id, type, actor_id, entity_type, entity_id, data)
    values (owner, 'inquiry_response', new.author_id, 'inquiry', new.inquiry_id,
            jsonb_build_object('product', pname, 'brand', bname, 'body', left(new.body, 140)));
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_inquiry_response on inquiry_responses;
create trigger trg_notify_inquiry_response
  after insert on inquiry_responses
  for each row execute function public.notify_on_inquiry_response();

-- ── like (reaction) on your review / comment / response ──────────────
create or replace function public.notify_on_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid; pname text := null; bname text := null; nav_type text; nav_id uuid;
begin
  if new.entity_type = 'review' then
    select author_id, product_name, coalesce(brand_name, ''), 'review', id
      into owner, pname, bname, nav_type, nav_id
      from reviews where id = new.entity_id;
  elsif new.entity_type = 'review_comment' then
    select c.author_id, r.product_name, coalesce(r.brand_name, ''), 'review', r.id
      into owner, pname, bname, nav_type, nav_id
      from review_comments c join reviews r on r.id = c.review_id
      where c.id = new.entity_id;
  elsif new.entity_type = 'inquiry_response' then
    select rsp.author_id, i.product_name, coalesce(i.brand_name, ''), 'inquiry', i.id
      into owner, pname, bname, nav_type, nav_id
      from inquiry_responses rsp join inquiries i on i.id = rsp.inquiry_id
      where rsp.id = new.entity_id;
  else
    return new;
  end if;

  if owner is not null and owner <> new.user_id then
    insert into notifications (user_id, type, actor_id, entity_type, entity_id, data)
    values (owner, 'reaction', new.user_id, nav_type, nav_id,
            jsonb_build_object('product', pname, 'brand', bname, 'target', new.entity_type));
  end if;
  return new;
end $$;

drop trigger if exists trg_notify_reaction on reactions;
create trigger trg_notify_reaction
  after insert on reactions
  for each row execute function public.notify_on_reaction();
