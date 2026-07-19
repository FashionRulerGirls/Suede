import type { SupabaseClient } from '@supabase/supabase-js';

/* Admin dashboard Phase 2 — action queues. Loaders + mutations for Capsule
   requests, Capsule applications, platform feedback, and brand management.
   All hit tables with admin-FOR-ALL RLS, so a non-admin session is inert. */

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'brand';
}

// ── Capsule Requests (brand_suggestions, status 'new') — §5d ─────────
export async function loadCapsuleRequests(sb: SupabaseClient) {
  const { data } = await sb.from('brand_suggestions')
    .select('id, name, url, why, status, created_at, author:profiles!submitted_by(username, display_name)')
    .eq('status', 'new').order('created_at', { ascending: false });
  return (data || []).map((r: any) => ({
    id: r.id, name: r.name, url: r.url, why: r.why, created_at: r.created_at,
    by: r.author?.username ? '@' + r.author.username : (r.author?.display_name || '—'),
  }));
}

// Approve → ensure a Capsule brand exists for this name; mark the suggestion added.
export async function approveCapsuleRequest(sb: SupabaseClient, id: string, name: string, url?: string | null) {
  await ensureCapsuleBrand(sb, name, url);
  const { error } = await sb.from('brand_suggestions').update({ status: 'added' }).eq('id', id);
  if (error) throw error;
}
export async function rejectCapsuleRequest(sb: SupabaseClient, id: string) {
  const { error } = await sb.from('brand_suggestions').update({ status: 'reviewed' }).eq('id', id);
  if (error) throw error;
}

// ── Capsule Applications (brand_applications) — §6a ──────────────────
export async function loadApplications(sb: SupabaseClient) {
  const { data } = await sb.from('brand_applications')
    .select('id, brand_name, website, email, ownership, ownership_other, founding_year, pitch, status, created_at')
    .order('created_at', { ascending: false });
  return (data || []).map((a: any) => ({
    id: a.id, brand: a.brand_name, website: a.website, email: a.email,
    role: a.ownership === 'Other' ? (a.ownership_other || 'Other') : a.ownership,
    foundingYear: a.founding_year, why: a.pitch, created_at: a.created_at,
    status: a.status === 'pending' ? 'New' : 'Reviewed',
  }));
}
export async function markApplicationReviewed(sb: SupabaseClient, id: string, adminId: string) {
  const { error } = await sb.from('brand_applications')
    .update({ status: 'reviewed', reviewed_at: new Date().toISOString(), reviewed_by: adminId }).eq('id', id);
  if (error) throw error;
}

// ── Platform Feedback (feedback) — §8 ────────────────────────────────
export async function loadFeedback(sb: SupabaseClient) {
  const { data } = await sb.from('feedback')
    .select('id, message, email, status, created_at, author:profiles!user_id(username)')
    .order('created_at', { ascending: false });
  return (data || []).map((f: any) => ({
    id: f.id, message: f.message, created_at: f.created_at,
    by: f.author?.username ? '@' + f.author.username : (f.email || 'Anonymous'),
    status: f.status === 'reviewed' ? 'Reviewed' : 'New',
  }));
}
export async function markFeedbackReviewed(sb: SupabaseClient, id: string) {
  const { error } = await sb.from('feedback').update({ status: 'reviewed', reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ── Brand Management — §5a / §5b ─────────────────────────────────────
export async function loadCapsuleBrands(sb: SupabaseClient) {
  const { data } = await sb.from('brands').select('id, name, slug, shop_url, social, created_at').eq('is_capsule', true).order('name');
  return (data || []).map((b: any) => ({ id: b.id, name: b.name, slug: b.slug, website: b.shop_url || '', instagram: b.social || '', created_at: b.created_at }));
}

// Non-Capsule = brand names seen on reviews that aren't a Capsule brand.
export async function loadNonCapsuleBrands(sb: SupabaseClient) {
  const [{ data: caps }, { data: revs }] = await Promise.all([
    sb.from('brands').select('name').eq('is_capsule', true),
    sb.from('reviews').select('brand_name').not('brand_name', 'is', null),
  ]);
  const capset = new Set((caps || []).map((c: any) => (c.name || '').toLowerCase()));
  const counts = new Map<string, number>();
  for (const r of (revs || []) as any[]) {
    const n = (r.brand_name || '').trim();
    if (!n || capset.has(n.toLowerCase())) continue;
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  return Array.from(counts, ([name, reviews]) => ({ name, reviews })).sort((a, b) => b.reviews - a.reviews);
}

export async function updateBrand(sb: SupabaseClient, id: string, fields: { name?: string; slug?: string; website?: string; instagram?: string }) {
  const patch: Record<string, any> = {};
  if (fields.name !== undefined) patch.name = fields.name.trim();
  if (fields.slug !== undefined) patch.slug = slugify(fields.slug);
  if (fields.website !== undefined) patch.shop_url = fields.website.trim() || null;
  if (fields.instagram !== undefined) patch.social = fields.instagram.trim() || null;
  const { error } = await sb.from('brands').update(patch).eq('id', id);
  if (error) throw error;
}

// Remove from Capsule (demote); the brand still exists for its reviews.
export async function removeFromCapsule(sb: SupabaseClient, id: string) {
  const { error } = await sb.from('brands').update({ is_capsule: false }).eq('id', id);
  if (error) throw error;
}

// Promote a non-capsule brand name into the Capsule, relinking its reviews.
export async function promoteBrandByName(sb: SupabaseClient, name: string) {
  const id = await ensureCapsuleBrand(sb, name, null);
  if (id) await sb.from('reviews').update({ brand_id: id }).ilike('brand_name', name).is('brand_id', null);
}

// Flag a non-capsule brand name for review (§5b action → moderation_flags).
export async function flagBrandName(sb: SupabaseClient, name: string, adminId: string) {
  const { error } = await sb.from('moderation_flags').insert({
    entity_type: 'brand_name', entity_id: '00000000-0000-0000-0000-000000000000',
    reason: 'admin_flag', source: 'user', detail: { brand_name: name }, raised_by: adminId,
  });
  if (error) throw error;
}

// Find a brand by name (make it Capsule) or create a Capsule brand. Returns id.
async function ensureCapsuleBrand(sb: SupabaseClient, name: string, url?: string | null): Promise<string | null> {
  const n = name.trim();
  const { data: existing } = await sb.from('brands').select('id').ilike('name', n).limit(1).maybeSingle();
  if (existing?.id) {
    await sb.from('brands').update({ is_capsule: true, ...(url ? { shop_url: url } : {}) }).eq('id', existing.id);
    return existing.id;
  }
  let slug = slugify(n);
  // avoid a unique-slug collision
  const { data: clash } = await sb.from('brands').select('id').eq('slug', slug).limit(1).maybeSingle();
  if (clash?.id) slug = `${slug}-${Math.floor(Date.now() / 1000) % 100000}`;
  const { data, error } = await sb.from('brands').insert({ name: n, slug, is_capsule: true, shop_url: url || null }).select('id').single();
  if (error) throw error;
  return data?.id || null;
}
