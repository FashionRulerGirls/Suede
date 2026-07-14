/* Suede — reviews & inquiries data access. Writes from the create forms and
   reads for the member's own profile feed. Media upload is handled separately
   (deferred); rows persist without photos for now. */
import type { SupabaseClient } from '@supabase/supabase-js';
import { inchesToHeight, inchesDisplay } from './profileData';

// ── helpers ────────────────────────────────────────────────────────
// Resolve a brand name to an existing Capsule brand row. Non-capsule brands
// stay as free text with a null brand_id.
export async function resolveBrandId(sb: SupabaseClient, name?: string | null): Promise<string | null> {
  const q = (name || '').trim();
  if (!q) return null;
  const { data } = await sb.from('brands').select('id').ilike('name', q).limit(1).maybeSingle();
  return (data as any)?.id ?? null;
}

// Values placed inside a PostgREST or()/and() filter string must be wrapped in
// double quotes when they may contain reserved characters (commas, parens,
// dots), or they get parsed as filter syntax. Escape embedded " and \.
function pgrstQuote(v: string): string {
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// A display-string snapshot of the member's current measurements, stored on the
// review/inquiry so the card shows the fit even if the profile changes later.
async function measurementSnapshot(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from('measurements')
    .select('height_in,bust_in,waist_in,hips_in')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return null;
  const m = data as any;
  return {
    height: inchesToHeight(m.height_in) || undefined,
    bust: inchesDisplay(m.bust_in) || undefined,
    waist: inchesDisplay(m.waist_in) || undefined,
    hips: inchesDisplay(m.hips_in) || undefined,
  };
}

const clampRating = (n: any) => {
  const v = Number(n);
  return v >= 1 && v <= 5 ? Math.round(v) : null; // 0 / unrated → null (satisfies 1–5 check)
};

// Average of the rated dimensions, to the nearest half-star (for card display).
function ratingAverage(row: any): number | null {
  const vals = ['rating_sizing', 'rating_material', 'rating_value', 'rating_photos', 'rating_service']
    .map((k) => row[k]).filter((v) => v != null);
  if (!vals.length) return null;
  const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
  return Math.round(avg * 2) / 2;
}

// ── writes ─────────────────────────────────────────────────────────
export type NewReview = {
  brandName?: string;
  productName: string;
  productUrl?: string;
  contentLink?: string;
  sizeScale?: string;
  sizeValue?: string;
  sizeOther?: string;
  ratings: { sizing: number; material: number; value: number; photos: number; service: number };
  body: string;
  recommend: boolean | null;
  hideMeasurements: boolean;
  sizeSatisfaction?: any;
};

export async function createReview(sb: SupabaseClient, userId: string, r: NewReview) {
  const [brand_id, snap] = await Promise.all([
    resolveBrandId(sb, r.brandName),
    measurementSnapshot(sb, userId),
  ]);
  const { data, error } = await sb.from('reviews').insert({
    author_id: userId,
    brand_id,
    brand_name: r.brandName?.trim() || null,
    product_name: r.productName.trim(),
    product_url: r.productUrl?.trim() || null,
    size_scale: r.sizeScale || null,
    size_value: r.sizeValue || null,
    size_other: r.sizeOther?.trim() || null,
    rating_sizing: clampRating(r.ratings.sizing),
    rating_material: clampRating(r.ratings.material),
    rating_value: clampRating(r.ratings.value),
    rating_photos: clampRating(r.ratings.photos),
    rating_service: clampRating(r.ratings.service),
    body: r.body.trim(),
    recommend: r.recommend,
    hide_measurements: !!r.hideMeasurements,
    measurements_snapshot: snap,
    size_satisfaction: r.sizeSatisfaction ?? null,
  }).select('id').single();
  if (error) throw error;
  return data;
}

// Edits are allowed for 24h after posting.
export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
export function canEditReview(createdAt?: string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;
}

export async function updateReview(sb: SupabaseClient, userId: string, reviewId: string, r: Partial<NewReview>) {
  const patch: Record<string, any> = {};
  if (r.brandName !== undefined) {
    patch.brand_id = await resolveBrandId(sb, r.brandName);
    patch.brand_name = r.brandName?.trim() || null;
  }
  if (r.productName !== undefined) patch.product_name = r.productName.trim();
  if (r.sizeScale !== undefined) patch.size_scale = r.sizeScale || null;
  if (r.sizeValue !== undefined) patch.size_value = r.sizeValue || null;
  if (r.sizeOther !== undefined) patch.size_other = r.sizeOther?.trim() || null;
  if (r.ratings) {
    patch.rating_sizing = clampRating(r.ratings.sizing);
    patch.rating_material = clampRating(r.ratings.material);
    patch.rating_value = clampRating(r.ratings.value);
    patch.rating_photos = clampRating(r.ratings.photos);
    patch.rating_service = clampRating(r.ratings.service);
  }
  if (r.body !== undefined) patch.body = r.body.trim();
  if (r.recommend !== undefined) patch.recommend = r.recommend;
  if (r.hideMeasurements !== undefined) patch.hide_measurements = !!r.hideMeasurements;
  if (r.sizeSatisfaction !== undefined) patch.size_satisfaction = r.sizeSatisfaction ?? null;
  const { error } = await sb.from('reviews').update(patch).eq('id', reviewId).eq('author_id', userId);
  if (error) throw error;
}

// Soft delete: hide from every feed (author-update RLS permits this; no hard
// delete policy needed). Media/comments remain but become unreachable.
export async function deleteReview(sb: SupabaseClient, userId: string, reviewId: string) {
  const { error } = await sb.from('reviews').update({ status: 'removed' }).eq('id', reviewId).eq('author_id', userId);
  if (error) throw error;
}

export type NewInquiry = {
  brandName?: string;
  productName: string;
  productUrl?: string;
  category?: string;
  sizeScale?: string;
  sizeValue?: string;
  sizeOther?: string;
  body: string;
};

export async function createInquiry(sb: SupabaseClient, userId: string, q: NewInquiry) {
  const [brand_id, snap] = await Promise.all([
    resolveBrandId(sb, q.brandName),
    measurementSnapshot(sb, userId),
  ]);
  const { data, error } = await sb.from('inquiries').insert({
    author_id: userId,
    brand_id,
    brand_name: q.brandName?.trim() || null,
    product_name: q.productName.trim(),
    product_url: q.productUrl?.trim() || null,
    category: q.category || null,
    size_scale: q.sizeScale || null,
    size_value: q.sizeValue || null,
    size_other: q.sizeOther?.trim() || null,
    body: q.body.trim(),
    measurements_snapshot: snap,
  }).select('id').single();
  if (error) throw error;
  return data;
}

// ── reads ──────────────────────────────────────────────────────────
function personFromAuthor(a: any) {
  if (!a) return undefined;
  return {
    name: a.display_name || a.username || 'Member',
    handle: '@' + (a.username || ''),
    avatar: a.avatar_url || '',
  };
}

export function reviewRowToCard(row: any) {
  return {
    _id: row.id,
    authorId: row.author_id,
    reviewer: personFromAuthor(row.author),
    product: row.product_name,
    size: row.size_value || row.size_other || '',
    brand: row.brand_name || '',
    rating: ratingAverage(row),
    excerpt: row.body,
    measurements: row.measurements_snapshot || {},
    hideMeasurements: !!row.hide_measurements,
    recommend: row.recommend,
    created_at: row.created_at,
  };
}

export function inquiryRowToCard(row: any) {
  return {
    _id: row.id,
    authorId: row.author_id,
    asker: personFromAuthor(row.author),
    product: row.product_name,
    size: row.size_value || row.size_other || '',
    brand: row.brand_name || '',
    measurements: row.measurements_snapshot || {},
    question: row.body,
    responses: [],
    status: row.status === 'answered' ? 'Answered' : 'Awaiting response',
    replies: 0,
    created_at: row.created_at,
  };
}

const REVIEW_SELECT = '*, author:profiles!author_id(username, display_name, avatar_url)';
const INQUIRY_SELECT = '*, author:profiles!author_id(username, display_name, avatar_url)';

// media has a polymorphic parent (no FK to embed), so fetch it in one batch and
// attach the first image + an "extra" count to each card.
async function attachReviewMedia(sb: SupabaseClient, cards: any[]) {
  const ids = cards.map((c) => c._id).filter(Boolean);
  if (!ids.length) return cards;
  const { data } = await sb
    .from('media')
    .select('parent_id, url, kind, position, poster_url')
    .eq('parent_type', 'review')
    .in('parent_id', ids)
    .order('position', { ascending: true });
  const byId: Record<string, any[]> = {};
  (data || []).forEach((m: any) => { (byId[m.parent_id] = byId[m.parent_id] || []).push(m); });
  return cards.map((c) => {
    const ms = byId[c._id] || [];
    // Prefer a real photo for the thumbnail; otherwise a video's chosen poster.
    const firstImage = ms.find((m: any) => m.kind === 'image');
    const firstPoster = ms.find((m: any) => m.poster_url)?.poster_url;
    const thumb = firstImage?.url || firstPoster || ms[0]?.url;
    return { ...c, image: thumb || c.image, extraCount: ms.length > 1 ? ms.length - 1 : undefined };
  });
}

// Like + comment counts for a batch of review cards.
async function attachReviewStats(sb: SupabaseClient, cards: any[]) {
  const ids = cards.map((c) => c._id).filter(Boolean);
  if (!ids.length) return cards;
  const [rx, cm] = await Promise.all([
    loadReactions(sb, undefined, 'review', ids),
    sb.from('review_comments').select('review_id').in('review_id', ids),
  ]);
  const cc: Record<string, number> = {};
  ((cm as any).data || []).forEach((r: any) => { cc[r.review_id] = (cc[r.review_id] || 0) + 1; });
  return cards.map((c) => ({ ...c, likes: rx.counts[c._id] || 0, comments: cc[c._id] || 0 }));
}

async function enrichReviewCards(sb: SupabaseClient, cards: any[], viewerId?: string) {
  return attachMatches(sb, viewerId, await attachReviewStats(sb, await attachReviewMedia(sb, cards)));
}

// Suede Match (proximity + confidence) between the viewer and one other member.
// Uses the security-definer suede_match function, so the other member's raw
// measurements are never exposed.
export async function loadMatch(sb: SupabaseClient, viewerId: string, otherId: string) {
  if (!viewerId || !otherId || viewerId === otherId) return null;
  try {
    const { data } = await sb.rpc('suede_match', { viewer: viewerId, other: otherId });
    const row = Array.isArray(data) ? data[0] : data;
    return row && row.score != null ? { score: row.score as number, confidence: row.confidence as string } : null;
  } catch { return null; }
}

// Attach each card's match for the viewer (deduped by author; self → null).
export async function attachMatches(sb: SupabaseClient, viewerId: string | undefined, cards: any[]) {
  if (!viewerId) return cards;
  const ids = Array.from(new Set(cards.map((c) => c.authorId).filter((id) => id && id !== viewerId)));
  const entries = await Promise.all(ids.map(async (id) => [id, await loadMatch(sb, viewerId, id)] as const));
  const map = Object.fromEntries(entries);
  return cards.map((c) => ({ ...c, match: c.authorId && c.authorId !== viewerId ? (map[c.authorId] || null) : null }));
}

export async function loadReviewMedia(sb: SupabaseClient, reviewId: string): Promise<{ id: string; url: string; kind: string; position: number; poster?: string | null }[]> {
  const { data } = await sb
    .from('media')
    .select('id, url, kind, position, poster_url')
    .eq('parent_type', 'review')
    .eq('parent_id', reviewId)
    .order('position', { ascending: true });
  return (data || []).map((m: any) => ({ id: m.id, url: m.url, kind: m.kind, position: m.position, poster: m.poster_url }));
}

// Remove a media row (RLS restricts this to the parent review's author).
export async function deleteReviewMedia(sb: SupabaseClient, mediaId: string) {
  const { error } = await sb.from('media').delete().eq('id', mediaId);
  if (error) throw error;
}

// ── reactions (likes / helpful) ────────────────────────────────────
export type ReactionType = 'review' | 'review_comment' | 'inquiry_response';

// Counts per entity + which the current user has reacted to, for a batch of ids.
export async function loadReactions(sb: SupabaseClient, userId: string | undefined, entityType: ReactionType, ids: string[]) {
  const clean = ids.filter(Boolean);
  if (!clean.length) return { counts: {} as Record<string, number>, mine: new Set<string>() };
  const { data } = await sb.from('reactions').select('entity_id, user_id').eq('entity_type', entityType).in('entity_id', clean);
  const counts: Record<string, number> = {};
  const mine = new Set<string>();
  (data || []).forEach((r: any) => {
    counts[r.entity_id] = (counts[r.entity_id] || 0) + 1;
    if (userId && r.user_id === userId) mine.add(r.entity_id);
  });
  return { counts, mine };
}

export async function setReaction(sb: SupabaseClient, userId: string, entityType: ReactionType, entityId: string, on: boolean) {
  if (on) {
    const { error } = await sb.from('reactions').upsert(
      { user_id: userId, entity_type: entityType, entity_id: entityId },
      { onConflict: 'user_id,entity_type,entity_id' },
    );
    if (error) throw error;
  } else {
    const { error } = await sb.from('reactions').delete()
      .eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId);
    if (error) throw error;
  }
}

// ── brand directory (The Capsule + brand pages) ────────────────────
function mapBrand(b: any, s: any) {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    tagline: b.tagline || '',
    founder: b.founder || '',
    founded: b.founded_year || '',
    location: b.location || '',
    social: b.social || ('@' + b.slug),
    image: b.hero_image_url || '',
    hero: b.hero_image_url || '',
    is_capsule: b.is_capsule,
    status: b.status,
    rating: s?.avg_rating != null ? Number(s.avg_rating) : 0,
    reviews: s?.review_count || 0,
    inquiries: s?.inquiry_count || 0,
    followers: s?.follower_count || 0,
  };
}

export async function loadBrands(sb: SupabaseClient, opts: { capsuleOnly?: boolean } = {}) {
  let q = sb.from('brands').select('*');
  if (opts.capsuleOnly) q = q.eq('is_capsule', true);
  const [{ data: brands }, { data: stats }] = await Promise.all([
    q.order('name'),
    sb.from('brand_stats').select('*'),
  ]);
  const statsById: Record<string, any> = {};
  (stats || []).forEach((s: any) => { statsById[s.id] = s; });
  return (brands || []).map((b: any) => mapBrand(b, statsById[b.id]));
}

// ── follows (brands + members) ─────────────────────────────────────
async function count(sb: SupabaseClient, table: string, col: string, value: string) {
  const { count: n } = await sb.from(table).select('*', { count: 'exact', head: true }).eq(col, value);
  return n || 0;
}

export async function isFollowingBrand(sb: SupabaseClient, userId: string, brandId: string) {
  const { data } = await sb.from('brand_follows').select('brand_id').eq('user_id', userId).eq('brand_id', brandId).maybeSingle();
  return !!data;
}
export async function setBrandFollow(sb: SupabaseClient, userId: string, brandId: string, on: boolean) {
  if (on) {
    const { error } = await sb.from('brand_follows').upsert({ user_id: userId, brand_id: brandId }, { onConflict: 'user_id,brand_id' });
    if (error) throw error;
  } else {
    const { error } = await sb.from('brand_follows').delete().eq('user_id', userId).eq('brand_id', brandId);
    if (error) throw error;
  }
}
export const brandFollowerCount = (sb: SupabaseClient, brandId: string) => count(sb, 'brand_follows', 'brand_id', brandId);
export const countFollowedBrands = (sb: SupabaseClient, userId: string) => count(sb, 'brand_follows', 'user_id', userId);

// Names of the brands a member follows (for the Capsule Feed + Brands list).
export async function loadFollowedBrandNames(sb: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await sb.from('brand_follows').select('brands(name)').eq('user_id', userId);
  return (data || []).map((r: any) => r.brands?.name).filter(Boolean);
}

// Ids of the brands a member follows (for the Capsule directory follow toggles).
export async function loadFollowedBrandIds(sb: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await sb.from('brand_follows').select('brand_id').eq('user_id', userId);
  return (data || []).map((r: any) => r.brand_id).filter(Boolean);
}

export async function isFollowingMember(sb: SupabaseClient, followerId: string, followeeId: string) {
  const { data } = await sb.from('member_follows').select('followee_id').eq('follower_id', followerId).eq('followee_id', followeeId).maybeSingle();
  return !!data;
}
export async function setMemberFollow(sb: SupabaseClient, followerId: string, followeeId: string, on: boolean) {
  if (on) {
    const { error } = await sb.from('member_follows').upsert({ follower_id: followerId, followee_id: followeeId }, { onConflict: 'follower_id,followee_id' });
    if (error) throw error;
  } else {
    const { error } = await sb.from('member_follows').delete().eq('follower_id', followerId).eq('followee_id', followeeId);
    if (error) throw error;
  }
}
export const memberFollowerCount = (sb: SupabaseClient, userId: string) => count(sb, 'member_follows', 'followee_id', userId);
const memberFollowingCount = (sb: SupabaseClient, userId: string) => count(sb, 'member_follows', 'follower_id', userId);

// ── member directory (The Collective + member profiles) ────────────
function measurementsDisplay(m: any) {
  if (!m) return {};
  return {
    height: inchesToHeight(m.height_in) || undefined,
    bust: inchesDisplay(m.bust_in) || undefined,
    waist: inchesDisplay(m.waist_in) || undefined,
    hips: inchesDisplay(m.hips_in) || undefined,
    inseam: inchesDisplay(m.inseam_in) || undefined,
    shoulder: inchesDisplay(m.shoulder_in) || undefined,
    arm: inchesDisplay(m.arm_in) || undefined,
    torso: inchesDisplay(m.torso_in) || undefined,
    usual_sizes: m.usual_sizes || {},
  };
}
async function memberMeasurements(sb: SupabaseClient, memberId: string) {
  try {
    const { data } = await sb.rpc('member_measurements', { uid: memberId });
    return Array.isArray(data) ? data[0] : data;
  } catch { return null; }
}

// The Collective directory: only COMPLETE profiles (name + avatar + bio +
// core measurements), via a security-definer function so a member's
// measurements can be checked without exposing them. Falls back to the plain
// profiles query if the 0007 function isn't applied yet.
export async function loadCollectiveMembers(sb: SupabaseClient, viewerId?: string, limit = 60) {
  let rows: any[] | null = null;
  const rpc = await sb.rpc('collective_members');
  if (!rpc.error) {
    rows = rpc.data as any[];
  } else {
    const { data } = await sb
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .eq('show_in_collective', true)
      .limit(limit);
    rows = data as any[];
  }
  let members = (rows || []).filter((p: any) => p.id !== viewerId).slice(0, limit);
  // viewer's follow set + match per member
  let followingSet = new Set<string>();
  if (viewerId) {
    const { data: f } = await sb.from('member_follows').select('followee_id').eq('follower_id', viewerId);
    followingSet = new Set((f || []).map((r: any) => r.followee_id));
  }
  const withMatch = await Promise.all(members.map(async (p: any) => ({
    id: p.id,
    name: p.display_name || p.username,
    handle: '@' + p.username,
    avatar: p.avatar_url || '',
    bio: p.bio || '',
    following: followingSet.has(p.id),
    match: viewerId ? await loadMatch(sb, viewerId, p.id) : null,
  })));
  return withMatch;
}

export async function loadMemberProfile(sb: SupabaseClient, memberId: string, viewerId?: string) {
  const [{ data: p }, followers, following, revCount, inqCount, meas, match] = await Promise.all([
    sb.from('profiles').select('id, username, display_name, avatar_url, bio, instagram, tiktok, website').eq('id', memberId).maybeSingle(),
    memberFollowerCount(sb, memberId),
    memberFollowingCount(sb, memberId),
    count(sb, 'reviews', 'author_id', memberId),
    count(sb, 'inquiries', 'author_id', memberId),
    memberMeasurements(sb, memberId),
    viewerId ? loadMatch(sb, viewerId, memberId) : Promise.resolve(null),
  ]);
  if (!p) return null;
  const prof = p as any;
  return {
    id: prof.id,
    name: prof.display_name || prof.username,
    handle: '@' + prof.username,
    avatar: prof.avatar_url || '',
    bio: prof.bio || '',
    social: prof.instagram || prof.tiktok || ('@' + prof.username),
    instagram: prof.instagram, tiktok: prof.tiktok, website: prof.website,
    measurements: measurementsDisplay(meas),
    match,
    followers: String(followers),
    followingCount: String(following),
    reviews: String(revCount),
    inquiries: String(inqCount),
  };
}

export async function loadMemberReviews(sb: SupabaseClient, memberId: string, viewerId?: string) {
  const { data } = await sb.from('reviews').select(REVIEW_SELECT).eq('author_id', memberId).eq('status', 'published').order('created_at', { ascending: false });
  return enrichReviewCards(sb, (data || []).map(reviewRowToCard), viewerId);
}
export async function loadMemberInquiries(sb: SupabaseClient, memberId: string, viewerId?: string) {
  const { data } = await sb.from('inquiries').select(INQUIRY_SELECT).eq('author_id', memberId).neq('status', 'removed').order('created_at', { ascending: false });
  return attachMatches(sb, viewerId, (data || []).map(inquiryRowToCard));
}

export async function loadUserReviews(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('author_id', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });
  return enrichReviewCards(sb, (data || []).map(reviewRowToCard));
}

export async function loadUserInquiries(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from('inquiries')
    .select(INQUIRY_SELECT)
    .eq('author_id', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });
  return (data || []).map(inquiryRowToCard);
}

// Community-wide published feed (The Lookbook). viewerId enables Suede Match.
export async function loadPublishedReviews(sb: SupabaseClient, viewerId?: string, limit = 48) {
  const { data } = await sb
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return enrichReviewCards(sb, (data || []).map(reviewRowToCard), viewerId);
}

export async function loadPublishedInquiries(sb: SupabaseClient, viewerId?: string, limit = 48) {
  const { data } = await sb
    .from('inquiries')
    .select(INQUIRY_SELECT)
    .neq('status', 'removed')
    .order('created_at', { ascending: false })
    .limit(limit);
  return attachMatches(sb, viewerId, (data || []).map(inquiryRowToCard));
}

// Reviews / inquiries for a single brand (matched by id or free-text name).
export async function loadBrandReviews(sb: SupabaseClient, brandName: string, viewerId?: string, brandId?: string | null) {
  const id = brandId ?? (await resolveBrandId(sb, brandName));
  let q = sb.from('reviews').select(REVIEW_SELECT).eq('status', 'published');
  q = id ? q.or(`brand_id.eq.${id},brand_name.ilike.${pgrstQuote(brandName)}`) : q.ilike('brand_name', brandName);
  const { data } = await q.order('created_at', { ascending: false });
  return enrichReviewCards(sb, (data || []).map(reviewRowToCard), viewerId);
}

export async function loadBrandInquiries(sb: SupabaseClient, brandName: string, viewerId?: string, brandId?: string | null) {
  const id = brandId ?? (await resolveBrandId(sb, brandName));
  let q = sb.from('inquiries').select(INQUIRY_SELECT).neq('status', 'removed');
  q = id ? q.or(`brand_id.eq.${id},brand_name.ilike.${pgrstQuote(brandName)}`) : q.ilike('brand_name', brandName);
  const { data } = await q.order('created_at', { ascending: false });
  return attachMatches(sb, viewerId, (data || []).map(inquiryRowToCard));
}

// ── detail pages ───────────────────────────────────────────────────
export function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

export function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  return formatDate(iso);
}

export async function loadReviewById(sb: SupabaseClient, id: string) {
  const { data } = await sb.from('reviews').select(REVIEW_SELECT).eq('id', id).maybeSingle();
  return data as any;
}

export async function loadInquiryById(sb: SupabaseClient, id: string) {
  const { data } = await sb.from('inquiries').select(INQUIRY_SELECT).eq('id', id).maybeSingle();
  return data as any;
}

// Comments / responses (public read). Author measurements aren't readable by
// other members (owner-only RLS), so responder specs are left blank.
export async function loadReviewComments(sb: SupabaseClient, reviewId: string) {
  const { data } = await sb
    .from('review_comments')
    .select('id, body, created_at, author:profiles!author_id(username, display_name, avatar_url)')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });
  return (data || []).map((c: any) => ({
    id: c.id,
    avatar: c.author?.avatar_url || '',
    name: c.author?.display_name || c.author?.username || 'Member',
    when: relativeTime(c.created_at),
    body: c.body,
    likes: 0,
  }));
}

export async function loadInquiryResponses(sb: SupabaseClient, inquiryId: string) {
  const { data } = await sb
    .from('inquiry_responses')
    .select('id, body, created_at, author:profiles!author_id(username, display_name, avatar_url)')
    .eq('inquiry_id', inquiryId)
    .order('created_at', { ascending: true });
  return (data || []).map((c: any) => ({
    id: c.id,
    avatar: c.author?.avatar_url || '',
    name: c.author?.display_name || c.author?.username || 'Member',
    specs: '',
    when: relativeTime(c.created_at),
    body: c.body,
    likes: 0,
  }));
}

export async function postReviewComment(sb: SupabaseClient, userId: string, reviewId: string, body: string) {
  const { data, error } = await sb
    .from('review_comments')
    .insert({ review_id: reviewId, author_id: userId, body: body.trim() })
    .select('id, body, created_at, author:profiles!author_id(username, display_name, avatar_url)')
    .single();
  if (error) throw error;
  const c = data as any;
  return { id: c.id, avatar: c.author?.avatar_url || '', name: c.author?.display_name || c.author?.username || 'You', when: relativeTime(c.created_at), body: c.body, likes: 0 };
}

export async function postInquiryResponse(sb: SupabaseClient, userId: string, inquiryId: string, body: string) {
  const { data, error } = await sb
    .from('inquiry_responses')
    .insert({ inquiry_id: inquiryId, author_id: userId, body: body.trim() })
    .select('id, body, created_at, author:profiles!author_id(username, display_name, avatar_url)')
    .single();
  if (error) throw error;
  const c = data as any;
  return { id: c.id, avatar: c.author?.avatar_url || '', name: c.author?.display_name || c.author?.username || 'You', specs: '', when: relativeTime(c.created_at), body: c.body, likes: 0 };
}

// ── notifications ──────────────────────────────────────────────────
// Rows are written by database triggers (0006). Here we read them for the
// recipient and shape them for NotificationsScreen / the bell badge.
const NOTIF_SELECT = 'id, type, actor_id, entity_type, entity_id, data, read_at, created_at, actor:profiles!actor_id(username, display_name, avatar_url)';

function notifRowToItem(row: any) {
  const actor = row.actor
    ? { name: row.actor.display_name || row.actor.username || 'Member', avatar: row.actor.avatar_url || '' }
    : null;
  const d = row.data || {};
  const label = d.product ? (d.brand ? `${d.brand} — ${d.product}` : d.product) : undefined;
  let icon = 'bell', text = '', target: string | undefined, detail: string | undefined;
  switch (row.type) {
    case 'follow':
      icon = 'user-plus'; text = 'started following you'; break;
    case 'review_comment':
      icon = 'message'; text = 'commented on your review of'; target = label;
      detail = d.body ? `“${d.body}”` : undefined; break;
    case 'inquiry_response':
      icon = 'message'; text = 'responded to your inquiry about'; target = label;
      detail = d.body ? `“${d.body}”` : undefined; break;
    case 'reaction':
      icon = 'heart';
      text = d.target === 'review_comment' ? 'liked your comment on'
        : d.target === 'inquiry_response' ? 'liked your response about'
        : 'liked your review of';
      target = label; break;
    default:
      text = 'sent you an update';
  }
  return {
    id: row.id, actor, icon, text, target, detail,
    time: relativeTime(row.created_at), unread: !row.read_at,
    entityType: row.entity_type, entityId: row.entity_id,
  };
}

export async function loadNotifications(sb: SupabaseClient, userId: string, limit = 50) {
  const { data } = await sb
    .from('notifications')
    .select(NOTIF_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).map(notifRowToItem);
}

export async function unreadNotificationCount(sb: SupabaseClient, userId: string) {
  const { count: n } = await sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);
  return n || 0;
}

export async function markNotificationsRead(sb: SupabaseClient, userId: string) {
  await sb
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
}

// ── intake forms ───────────────────────────────────────────────────
// All three tables allow anyone to insert (RLS: with check (true)); admins
// read them from the dashboard. submitted_by is stamped when a member is
// signed in, otherwise null.
export async function submitBrandApplication(sb: SupabaseClient, p: {
  brandName: string; website?: string; email: string; location?: string;
  ownership?: string; ownershipOther?: string; foundingYear?: string; pitch: string;
}, userId?: string) {
  const { error } = await sb.from('brand_applications').insert({
    brand_name: p.brandName.trim(),
    website: p.website?.trim() || null,
    email: p.email.trim(),
    location: p.location?.trim() || null,
    ownership: p.ownership || null,
    ownership_other: p.ownershipOther?.trim() || null,
    founding_year: p.foundingYear?.trim() || null,
    pitch: p.pitch.trim(),
    submitted_by: userId || null,
  });
  if (error) throw error;
}

export async function submitBrandSuggestion(sb: SupabaseClient, p: {
  name: string; url?: string; why?: string;
}, userId?: string) {
  const { error } = await sb.from('brand_suggestions').insert({
    name: p.name.trim(),
    url: p.url?.trim() || null,
    why: p.why?.trim() || null,
    submitted_by: userId || null,
  });
  if (error) throw error;
}

export async function subscribeNewsletter(sb: SupabaseClient, email: string) {
  const e = email.trim().toLowerCase();
  // Idempotent: a repeat sign-up is a no-op, not an error.
  const { error } = await sb
    .from('newsletter_subscribers')
    .upsert({ email: e }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) throw error;
}
