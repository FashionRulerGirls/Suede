import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveBrandId } from '@/lib/contentData';

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

// ── Flag for Review — §5c (brand-name attribution) ──────────────────
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const PLACEHOLDERS = new Set(['na', 'n/a', 'brand', 'thebrand', 'unknown', 'test', 'none', 'null', '???']);

// Bounded Levenshtein (early-exit once past `max`).
function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

export type BrandFlag = { name: string; reviews: number; reason: 'duplicate' | 'misspelling' | 'junk'; suggestion: string | null };

// Advisory only — surfaces likely bad/duplicate brand-name entries. No name is
// changed without an explicit admin action below.
export async function loadFlagForReview(sb: SupabaseClient): Promise<BrandFlag[]> {
  const [{ data: caps }, { data: revs }, { data: flags }] = await Promise.all([
    sb.from('brands').select('name').eq('is_capsule', true),
    sb.from('reviews').select('brand_name').not('brand_name', 'is', null),
    sb.from('moderation_flags').select('detail, status').eq('entity_type', 'brand_name'),
  ]);
  const capNames = (caps || []).map((c: any) => (c.name || '').trim()).filter(Boolean);
  const dismissed = new Set((flags || []).filter((f: any) => f.status === 'dismissed').map((f: any) => norm(f.detail?.brand_name || '')));
  const capSet = new Set(capNames.map(norm));

  const counts = new Map<string, number>();
  for (const r of (revs || []) as any[]) {
    const n = (r.brand_name || '').trim();
    if (!n || capSet.has(norm(n))) continue;
    counts.set(n, (counts.get(n) || 0) + 1);
  }
  const nonCap = Array.from(counts.keys());
  const out: BrandFlag[] = [];
  for (const n of nonCap) {
    if (dismissed.has(norm(n))) continue;
    const nn = norm(n);
    // junk
    if (n.length < 3 || /^[^a-zA-Z0-9]+$/.test(n) || PLACEHOLDERS.has(nn)) { out.push({ name: n, reviews: counts.get(n)!, reason: 'junk', suggestion: null }); continue; }
    // misspelling of a capsule brand
    let miss: string | null = null;
    for (const c of capNames) { const d = editDistance(nn, norm(c), 2); if (d >= 1 && d <= 2) { miss = c; break; } }
    if (miss) { out.push({ name: n, reviews: counts.get(n)!, reason: 'misspelling', suggestion: miss }); continue; }
    // duplicate of another non-capsule variant (normalized match or edit-distance ≤2)
    let dup: string | null = null;
    for (const m of nonCap) {
      if (m === n) continue;
      if (norm(m) === nn || editDistance(nn, norm(m), 2) <= 2) { dup = (counts.get(m)! >= counts.get(n)!) ? m : null; if (dup) break; }
    }
    if (dup) out.push({ name: n, reviews: counts.get(n)!, reason: 'duplicate', suggestion: dup });
  }
  return out.sort((a, b) => b.reviews - a.reviews);
}

// Reassign every review under `fromName` to the canonical `toName` (+ brand_id).
export async function mergeBrandName(sb: SupabaseClient, fromName: string, toName: string) {
  const id = await resolveBrandId(sb, toName);
  const { error } = await sb.from('reviews').update({ brand_name: toName, brand_id: id }).ilike('brand_name', fromName);
  if (error) throw error;
}
// Rename a brand across its reviews (and link brand_id if the new name is known).
export async function correctBrandName(sb: SupabaseClient, fromName: string, newName: string) {
  const id = await resolveBrandId(sb, newName);
  const { error } = await sb.from('reviews').update({ brand_name: newName.trim(), brand_id: id }).ilike('brand_name', fromName);
  if (error) throw error;
}
// Mark a name accurate so it stops being auto-flagged.
export async function dismissBrandFlag(sb: SupabaseClient, name: string, adminId: string) {
  const { error } = await sb.from('moderation_flags').insert({
    entity_type: 'brand_name', entity_id: '00000000-0000-0000-0000-000000000000',
    reason: 'dismissed', source: 'auto', status: 'dismissed', detail: { brand_name: name }, raised_by: adminId, resolved_by: adminId,
  });
  if (error) throw error;
}

// ── Brand Claims — approve assigns brands.owner_id (§6b / claim flow) ─
export async function loadBrandClaims(sb: SupabaseClient) {
  const { data } = await sb.from('brand_claims')
    .select('id, brand_id, brand_name, claimant_name, role, work_email, instagram, note, domain_match, status, user_id, created_at')
    .eq('status', 'pending').order('created_at', { ascending: false });
  return (data || []).map((c: any) => ({
    id: c.id, brandId: c.brand_id, brand: c.brand_name, name: c.claimant_name, role: c.role,
    email: c.work_email, instagram: c.instagram, note: c.note, domainMatch: c.domain_match,
    userId: c.user_id, created_at: c.created_at,
    assignable: !!(c.brand_id && c.user_id), // need a known brand + a claimant account to hand over
  }));
}
// Approve: hand the brand to the claimant (owner_id) and mark the claim approved.
export async function approveBrandClaim(sb: SupabaseClient, id: string, brandId: string, userId: string, adminId: string) {
  const { error: e1 } = await sb.from('brands').update({ owner_id: userId }).eq('id', brandId);
  if (e1) throw e1;
  const { error: e2 } = await sb.from('brand_claims').update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: adminId }).eq('id', id);
  if (e2) throw e2;
}
export async function rejectBrandClaim(sb: SupabaseClient, id: string, adminId: string) {
  const { error } = await sb.from('brand_claims').update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: adminId }).eq('id', id);
  if (error) throw error;
}

// ── Brand-submitted flags on reviews/inquiries — §7 (admin side) ─────
export async function loadContentFlags(sb: SupabaseClient) {
  const { data } = await sb.from('moderation_flags')
    .select('id, entity_type, entity_id, reason, detail, status, created_at')
    .in('entity_type', ['review', 'inquiry']).eq('status', 'open').order('created_at', { ascending: false });
  return (data || []).map((f: any) => ({
    id: f.id, type: f.entity_type, entityId: f.entity_id, reason: f.reason,
    detail: f.detail?.note || '', created_at: f.created_at,
  }));
}
export async function resolveContentFlag(sb: SupabaseClient, id: string, adminId: string, action: 'dismiss' | 'remove', entityType?: string, entityId?: string) {
  if (action === 'remove' && entityType && entityId) {
    await sb.from(entityType === 'review' ? 'reviews' : 'inquiries').update({ status: 'removed' }).eq('id', entityId);
  }
  const { error } = await sb.from('moderation_flags').update({ status: action === 'remove' ? 'resolved' : 'dismissed', resolved_by: adminId }).eq('id', id);
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
