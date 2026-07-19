import type { SupabaseClient } from '@supabase/supabase-js';

/* Admin dashboard data layer (Phase 1 — read-only visibility). Every query
   below hits tables whose RLS already restricts rows to admins, so a non-admin
   session simply gets empty results. The UI is additionally gated by
   amIAdmin(). Aggregates are computed client-side — fine at launch scale. */

export async function amIAdmin(sb: SupabaseClient | null): Promise<boolean> {
  if (!sb) return false;
  const { data, error } = await sb.rpc('is_admin');
  return !error && data === true;
}

async function count(sb: SupabaseClient, table: string, build?: (q: any) => any): Promise<number> {
  let q = sb.from(table).select('id', { count: 'exact', head: true });
  if (build) q = build(q);
  const { count: c } = await q;
  return c || 0;
}

const DAY = 86_400_000;
function iso(msAgo: number) { return new Date(Date.now() - msAgo).toISOString(); }

// Average of positive (b - a) millisecond gaps, formatted as a human duration.
function avgGap(pairs: [string | null | undefined, string | null | undefined][]): string {
  const gaps = pairs
    .map(([a, b]) => (a && b ? new Date(b).getTime() - new Date(a).getTime() : NaN))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (!gaps.length) return '—';
  return formatDuration(gaps.reduce((s, n) => s + n, 0) / gaps.length);
}

export function formatDuration(ms: number): string {
  const min = ms / 60000;
  if (min < 60) return `${Math.round(min)} min`;
  const hr = min / 60;
  if (hr < 48) return `${hr.toFixed(1)} hr`;
  return `${(hr / 24).toFixed(1)} days`;
}

export type Overview = {
  members: number; newWeek: number; newMonth: number; complete: number; incomplete: number;
  source: { consultation: number; quiz: number; selfInput: number };
  avgProfileComplete: string;
  reviews: number; inquiries: number;
  avgFirstReview: string; avgFirstInquiry: string; avgCompleteReview: string; avgCompleteInquiry: string;
  suggestionsPending: number; feedbackTotal: number; applicationsNew: number; flagsOpen: number;
};

export async function loadOverview(sb: SupabaseClient): Promise<Overview> {
  const [members, newWeek, newMonth, reviews, inquiries] = await Promise.all([
    count(sb, 'profiles'),
    count(sb, 'profiles', (q) => q.gte('created_at', iso(7 * DAY))),
    count(sb, 'profiles', (q) => q.gte('created_at', iso(30 * DAY))),
    count(sb, 'reviews'),
    count(sb, 'inquiries'),
  ]);

  const [{ data: meas }, { data: profs }, { data: revRows }, { data: inqRows }] = await Promise.all([
    sb.from('measurements').select('user_id, bust_in, waist_in, hips_in, source'),
    sb.from('profiles').select('id, created_at, measurements_completed_at'),
    sb.from('reviews').select('author_id, created_at, review_started_at'),
    sb.from('inquiries').select('author_id, created_at, inquiry_started_at'),
  ]);

  const measRows = meas || [];
  const complete = measRows.filter((m: any) => m.bust_in != null && m.waist_in != null && m.hips_in != null).length;
  const source = { consultation: 0, quiz: 0, selfInput: 0 };
  for (const m of measRows as any[]) {
    if (m.source === 'tape' || m.source === 'consultation') source.consultation++;
    else if (m.source === 'quiz') source.quiz++;
    else source.selfInput++;
  }

  const profById: Record<string, any> = {};
  (profs || []).forEach((p: any) => { profById[p.id] = p; });
  const avgProfileComplete = avgGap((profs || []).map((p: any) => [p.created_at, p.measurements_completed_at]));

  // First-per-member review/inquiry vs the member's signup, for onboarding friction.
  const firstBy = (rows: any[], key: string) => {
    const first: Record<string, string> = {};
    for (const r of rows) { const k = r.author_id; if (!first[k] || r.created_at < first[k]) first[k] = r.created_at; }
    return Object.entries(first).map(([uid, when]) => [profById[uid]?.created_at, when] as [any, any]);
  };
  const avgFirstReview = avgGap(firstBy(revRows || [], 'r'));
  const avgFirstInquiry = avgGap(firstBy(inqRows || [], 'q'));
  const avgCompleteReview = avgGap((revRows || []).map((r: any) => [r.review_started_at, r.created_at]));
  const avgCompleteInquiry = avgGap((inqRows || []).map((r: any) => [r.inquiry_started_at, r.created_at]));

  const [suggestionsPending, feedbackTotal, applicationsNew, flagsOpen] = await Promise.all([
    count(sb, 'brand_suggestions', (q) => q.eq('status', 'new')),
    count(sb, 'feedback'),
    count(sb, 'brand_applications', (q) => q.eq('status', 'pending')),
    count(sb, 'moderation_flags', (q) => q.eq('status', 'open')),
  ]);

  return {
    members, newWeek, newMonth, complete, incomplete: Math.max(0, members - complete),
    source, avgProfileComplete, reviews, inquiries,
    avgFirstReview, avgFirstInquiry, avgCompleteReview, avgCompleteInquiry,
    suggestionsPending, feedbackTotal, applicationsNew, flagsOpen,
  };
}

// Signups grouped by week or month, oldest→newest, for the growth chart.
export async function loadGrowth(sb: SupabaseClient, granularity: 'week' | 'month'): Promise<{ label: string; count: number }[]> {
  const { data } = await sb.from('profiles').select('created_at').order('created_at', { ascending: true });
  const buckets = new Map<string, number>();
  for (const p of (data || []) as any[]) {
    const d = new Date(p.created_at);
    let key: string;
    if (granularity === 'month') key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    else { const onejan = new Date(d.getFullYear(), 0, 1); const wk = Math.ceil((((d.getTime() - onejan.getTime()) / DAY) + onejan.getDay() + 1) / 7); key = `${d.getFullYear()} W${String(wk).padStart(2, '0')}`; }
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return Array.from(buckets, ([label, count]) => ({ label, count }));
}

const REV_SEL = 'id, brand_name, created_at, rating_sizing, rating_material, rating_value, rating_photos, rating_service, status, author:profiles!author_id(display_name, username)';
function ratingAvg(r: any): number | null {
  const v = ['rating_sizing', 'rating_material', 'rating_value', 'rating_photos', 'rating_service'].map((k) => r[k]).filter((x) => x != null);
  return v.length ? Math.round((v.reduce((a: number, b: number) => a + b, 0) / v.length) * 2) / 2 : null;
}

export async function loadReviewActivity(sb: SupabaseClient, limit = 200) {
  const { data } = await sb.from('reviews').select(REV_SEL).order('created_at', { ascending: false }).limit(limit);
  return (data || []).map((r: any) => ({
    id: r.id, reviewer: r.author?.display_name || r.author?.username || 'Member',
    handle: r.author?.username ? '@' + r.author.username : '', brand: r.brand_name || '—',
    created_at: r.created_at, rating: ratingAvg(r), status: r.status,
  }));
}

export async function loadInquiryActivity(sb: SupabaseClient, limit = 200) {
  const { data } = await sb.from('inquiries').select('id, brand_name, created_at, status, author:profiles!author_id(display_name, username)').order('created_at', { ascending: false }).limit(limit);
  const rows = data || [];
  const ids = rows.map((r: any) => r.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: resp } = await sb.from('inquiry_responses').select('inquiry_id').in('inquiry_id', ids);
    for (const x of (resp || []) as any[]) counts[x.inquiry_id] = (counts[x.inquiry_id] || 0) + 1;
  }
  return rows.map((r: any) => ({
    id: r.id, member: r.author?.display_name || r.author?.username || 'Member',
    handle: r.author?.username ? '@' + r.author.username : '', brand: r.brand_name || '—',
    created_at: r.created_at, responses: counts[r.id] || 0, status: r.status,
  }));
}

export async function loadMemberDirectory(sb: SupabaseClient, limit = 500) {
  // admin_members() is a SECURITY DEFINER RPC that includes emails (from
  // auth.users) for admins only. Falls back to the profiles table if the
  // function isn't present yet (migration 0022 not run).
  const { data: rpcRows, error: rpcErr } = await sb.rpc('admin_members');
  let base: any[];
  if (!rpcErr && rpcRows) base = (rpcRows as any[]).slice(0, limit);
  else {
    const { data } = await sb.from('profiles').select('id, display_name, username, created_at').order('created_at', { ascending: false }).limit(limit);
    base = (data || []).map((p: any) => ({ ...p, email: '' }));
  }
  const [{ data: meas }, { data: revs }, { data: inqs }] = await Promise.all([
    sb.from('measurements').select('user_id, bust_in, waist_in, hips_in'),
    sb.from('reviews').select('author_id'),
    sb.from('inquiries').select('author_id'),
  ]);
  const complete = new Set((meas || []).filter((m: any) => m.bust_in != null && m.waist_in != null && m.hips_in != null).map((m: any) => m.user_id));
  const rc: Record<string, number> = {}; for (const r of (revs || []) as any[]) rc[r.author_id] = (rc[r.author_id] || 0) + 1;
  const qc: Record<string, number> = {}; for (const q of (inqs || []) as any[]) qc[q.author_id] = (qc[q.author_id] || 0) + 1;
  return base.map((p: any) => ({
    id: p.id, name: p.display_name || p.username || 'Member', handle: p.username ? '@' + p.username : '',
    email: p.email || '', created_at: p.created_at, complete: complete.has(p.id), reviews: rc[p.id] || 0, inquiries: qc[p.id] || 0,
  }));
}

// ── CSV export ──────────────────────────────────────────────────────
export function toCSV(headers: string[], rows: (string | number | boolean | null)[][]): string {
  const esc = (v: any) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
