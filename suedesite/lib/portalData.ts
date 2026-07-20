import type { SupabaseClient } from '@supabase/supabase-js';
import { uploadBrandDocument } from '@/lib/storage';

/* Brand portal data layer. A brand owner is a Suede account linked via
   brands.owner_id (assigned when an admin approves their claim). Everything
   here is permitted by the owner/authenticated RLS already in place:
   owner-edit on brands, member-insert on review_comments / inquiry_responses,
   and the user-report insert on moderation_flags. */

export type PortalBrand = { id: string; name: string; slug: string; tagline: string; longBio: string; website: string; instagram: string; category: string; location: string; founder: string };

export async function loadMyBrands(sb: SupabaseClient, ownerId: string): Promise<PortalBrand[]> {
  const { data } = await sb.from('brands').select('*').eq('owner_id', ownerId).order('name');
  return (data || []).map((b: any) => ({
    id: b.id, name: b.name, slug: b.slug, tagline: b.tagline || '', longBio: b.long_bio || '', website: b.shop_url || '',
    instagram: b.social || '', category: b.category || '', location: b.location || '', founder: b.founder || '',
  }));
}

// ── brand documents ─────────────────────────────────────────────────
export async function loadBrandDocuments(sb: SupabaseClient, brandId: string) {
  const { data } = await sb.from('brand_documents').select('id, label, url, position').eq('brand_id', brandId).order('position').order('created_at');
  return (data || []) as { id: string; label: string; url: string; position: number }[];
}
export async function addBrandDocument(sb: SupabaseClient, ownerId: string, brandId: string, label: string, file: File) {
  const url = await uploadBrandDocument(sb, ownerId, brandId, file);
  const { error } = await sb.from('brand_documents').insert({ brand_id: brandId, label: label.trim() || file.name, url });
  if (error) throw error;
}
export async function deleteBrandDocument(sb: SupabaseClient, id: string) {
  const { error } = await sb.from('brand_documents').delete().eq('id', id);
  if (error) throw error;
}

export async function loadBrandOverview(sb: SupabaseClient, brand: { id: string; name: string }) {
  const orFilter = `brand_id.eq.${brand.id},brand_name.ilike.${brand.name}`;
  const [{ data: revs }, { count: inqCount }, { count: followers }] = await Promise.all([
    sb.from('reviews').select('rating_sizing, rating_material, rating_value, rating_photos, rating_service')
      .or(orFilter).eq('status', 'published'),
    sb.from('inquiries').select('id', { count: 'exact', head: true }).or(orFilter).neq('status', 'removed'),
    sb.from('brand_follows').select('brand_id', { count: 'exact', head: true }).eq('brand_id', brand.id),
  ]);
  const rows = revs || [];
  const perReview = rows.map((r: any) => {
    const v = ['rating_sizing', 'rating_material', 'rating_value', 'rating_photos', 'rating_service'].map((k) => r[k]).filter((x) => x != null);
    return v.length ? v.reduce((a: number, b: number) => a + b, 0) / v.length : null;
  }).filter((x): x is number => x != null);
  const avg = perReview.length ? Math.round((perReview.reduce((a, b) => a + b, 0) / perReview.length) * 10) / 10 : null;
  return { reviews: rows.length, inquiries: inqCount || 0, avgRating: avg, followers: followers || 0 };
}

// Update a brand's public page fields (owner-edit RLS).
export async function saveBrandFields(sb: SupabaseClient, brandId: string, f: { tagline?: string; longBio?: string; website?: string; instagram?: string; category?: string; location?: string; founder?: string }) {
  const patch: Record<string, any> = {};
  if (f.tagline !== undefined) patch.tagline = f.tagline.trim() || null;
  if (f.longBio !== undefined) patch.long_bio = f.longBio.trim() || null;
  if (f.website !== undefined) patch.shop_url = f.website.trim() || null;
  if (f.instagram !== undefined) patch.social = f.instagram.trim() || null;
  if (f.category !== undefined) patch.category = f.category.trim() || null;
  if (f.location !== undefined) patch.location = f.location.trim() || null;
  if (f.founder !== undefined) patch.founder = f.founder.trim() || null;
  const { error } = await sb.from('brands').update(patch).eq('id', brandId);
  if (error) throw error;
}

// Brand flags a review/inquiry for admin review (§7 submission surface).
export async function submitContentFlag(sb: SupabaseClient, p: { entityType: 'review' | 'inquiry'; entityId: string; reason: string; note?: string; raisedBy: string }) {
  const { error } = await sb.from('moderation_flags').insert({
    entity_type: p.entityType, entity_id: p.entityId, reason: p.reason, source: 'user',
    detail: p.note ? { note: p.note } : null, raised_by: p.raisedBy,
  });
  if (error) throw error;
}
