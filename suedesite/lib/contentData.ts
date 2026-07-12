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

export async function loadUserReviews(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('author_id', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });
  return attachReviewMedia(sb, (data || []).map(reviewRowToCard));
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

// Community-wide published feed (The Lookbook).
export async function loadPublishedReviews(sb: SupabaseClient, limit = 48) {
  const { data } = await sb
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return attachReviewMedia(sb, (data || []).map(reviewRowToCard));
}

export async function loadPublishedInquiries(sb: SupabaseClient, limit = 48) {
  const { data } = await sb
    .from('inquiries')
    .select(INQUIRY_SELECT)
    .neq('status', 'removed')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []).map(inquiryRowToCard);
}

// Reviews / inquiries for a single brand (matched by id or free-text name).
export async function loadBrandReviews(sb: SupabaseClient, brandName: string, brandId?: string | null) {
  const id = brandId ?? (await resolveBrandId(sb, brandName));
  let q = sb.from('reviews').select(REVIEW_SELECT).eq('status', 'published');
  q = id ? q.or(`brand_id.eq.${id},brand_name.ilike.${brandName}`) : q.ilike('brand_name', brandName);
  const { data } = await q.order('created_at', { ascending: false });
  return attachReviewMedia(sb, (data || []).map(reviewRowToCard));
}

export async function loadBrandInquiries(sb: SupabaseClient, brandName: string, brandId?: string | null) {
  const id = brandId ?? (await resolveBrandId(sb, brandName));
  let q = sb.from('inquiries').select(INQUIRY_SELECT).neq('status', 'removed');
  q = id ? q.or(`brand_id.eq.${id},brand_name.ilike.${brandName}`) : q.ilike('brand_name', brandName);
  const { data } = await q.order('created_at', { ascending: false });
  return (data || []).map(inquiryRowToCard);
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
