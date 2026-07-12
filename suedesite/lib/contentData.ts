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

export async function loadUserReviews(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('author_id', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });
  return (data || []).map(reviewRowToCard);
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
  return (data || []).map(reviewRowToCard);
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
  return (data || []).map(reviewRowToCard);
}

export async function loadBrandInquiries(sb: SupabaseClient, brandName: string, brandId?: string | null) {
  const id = brandId ?? (await resolveBrandId(sb, brandName));
  let q = sb.from('inquiries').select(INQUIRY_SELECT).neq('status', 'removed');
  q = id ? q.or(`brand_id.eq.${id},brand_name.ilike.${brandName}`) : q.ilike('brand_name', brandName);
  const { data } = await q.order('created_at', { ascending: false });
  return (data || []).map(inquiryRowToCard);
}
