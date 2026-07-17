/* Profile + measurement data access and the inches conversion (numbers are
   stored in inches for Suede Match; the UI shows feet/inches). */
import type { SupabaseClient } from '@supabase/supabase-js';

// ── unit conversion ────────────────────────────────────────────────
export function heightToInches(display: string): number | null {
  if (!display) return null;
  const ftMatch = display.match(/(\d+)\s*'/);
  if (ftMatch) {
    const feet = parseInt(ftMatch[1], 10);
    const inMatch = display.match(/'\s*(\d+)/);
    const inches = inMatch ? parseInt(inMatch[1], 10) : 0;
    return feet * 12 + inches;
  }
  const n = parseFloat(display.replace(/[^\d.]/g, ''));
  return Number.isNaN(n) ? null : n;
}
export function inchesToHeight(n: number | null | undefined): string {
  if (n == null) return '';
  const feet = Math.floor(n / 12);
  const inches = Math.round(n % 12);
  return `${feet}'${inches}"`;
}
export function toInches(display: string): number | null {
  if (!display) return null;
  const n = parseFloat(String(display).replace(/[^\d.]/g, ''));
  return Number.isNaN(n) ? null : n;
}
export function inchesDisplay(n: number | null | undefined): string {
  return n == null ? '' : `${n}"`;
}

// ── shapes ─────────────────────────────────────────────────────────
export type DbProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  measurements_public: boolean;
  email_notifications: boolean;
  show_in_collective: boolean;
};
export type DbMeasurements = {
  height_in: number | null;
  bust_in: number | null;
  waist_in: number | null;
  hips_in: number | null;
  inseam_in: number | null;
  shoulder_in: number | null;
  arm_in: number | null;
  torso_in: number | null;
  usual_sizes: Record<string, any> | null;
  source: string | null;
  source_confidence: number | null;
};

// ── reads ──────────────────────────────────────────────────────────
export async function loadProfileData(sb: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: measurements }] = await Promise.all([
    // explicit columns (not '*') so this keeps working once is_admin is
    // removed from the public column grant in 0009; the client never uses it.
    sb.from('profiles').select('id, username, display_name, bio, avatar_url, instagram, tiktok, website, measurements_public, email_notifications, show_in_collective, accepted_terms_at, created_at').eq('id', userId).single(),
    sb.from('measurements').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  return {
    profile: (profile as DbProfile) ?? null,
    measurements: (measurements as DbMeasurements) ?? null,
  };
}

// True once the member has saved their core body measurements (height + the
// three girths). Used to flip the nav CTA from "Complete" to "Update".
export async function hasCoreMeasurements(sb: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await sb
    .from('measurements')
    .select('height_in, bust_in, waist_in, hips_in')
    .eq('user_id', userId)
    .maybeSingle();
  const m = data as any;
  return !!(m && m.height_in != null && m.bust_in != null && m.waist_in != null && m.hips_in != null);
}

// ── usual sizes ────────────────────────────────────────────────────
// Stored (and displayed) as { Tops, Bottoms, Waist, Plus } → string[]; only
// non-empty groups are kept. All three writers (edit-profile, quiz,
// consultation) normalise into this shape so the profile shows clean labels.
const SIZE_LETTERS = new Set(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS']);

export function buildUsualSizes(parts: {
  tops?: (string | undefined | null)[];
  bottoms?: (string | undefined | null)[];
  waist?: (string | undefined | null)[];
  plus?: (string | undefined | null)[];
}): Record<string, string[]> {
  const clean = (a?: (string | undefined | null)[]) =>
    (a || []).map((x) => (x == null ? '' : String(x).trim())).filter(Boolean);
  const out: Record<string, string[]> = {};
  const t = clean(parts.tops); if (t.length) out.Tops = t;
  const b = clean(parts.bottoms); if (b.length) out.Bottoms = b;
  const w = clean(parts.waist); if (w.length) out.Waist = w.map((x) => (/"$/.test(x) ? x : `${x}"`));
  const p = clean(parts.plus); if (p.length) out.Plus = p;
  return out;
}

// Reverse of buildUsualSizes for the edit-profile single-select fields.
export function splitUsualSizes(stored: Record<string, any> | null | undefined) {
  const g = (k: string): string[] => {
    const v = stored?.[k];
    return Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
  };
  const letter = (arr: string[]) => arr.find((x) => SIZE_LETTERS.has(x)) || '';
  const numeric = (arr: string[]) => arr.find((x) => /^\d+$/.test(x)) || '';
  const tops = g('Tops'), bottoms = g('Bottoms');
  return {
    topsLetter: letter(tops), topsNum: numeric(tops),
    botLetter: letter(bottoms), botNum: numeric(bottoms),
    waist: (g('Waist')[0] || '').replace(/"/g, ''),
    plus: g('Plus')[0] || '',
  };
}

// ── writes ─────────────────────────────────────────────────────────
export async function saveProfileFields(sb: SupabaseClient, userId: string, fields: Partial<DbProfile>) {
  return sb.from('profiles').update(fields).eq('id', userId);
}

export async function saveMeasurements(
  sb: SupabaseClient,
  userId: string,
  m: Partial<DbMeasurements>,
) {
  // Drop undefined keys so an upsert never clobbers columns the caller didn't
  // set (e.g. the quiz doesn't estimate shoulder/arm/torso).
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(m)) if (v !== undefined) clean[k] = v;
  return sb.from('measurements').upsert(
    { user_id: userId, ...clean, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
}

// Quiz confidence label → source_confidence ceiling (the estimate carries a
// lower match confidence than a tape/manual profile).
const QUIZ_CONFIDENCE: Record<string, number> = { high: 0.7, medium: 0.55, low: 0.4 };

// Persist a Quick Fit quiz: the derived measurements land on the profile, and
// the full run is logged to quiz_results.
export async function saveQuizResult(
  sb: SupabaseClient,
  userId: string,
  input: {
    answers: Record<string, any>;
    derived: { bust: number; waist: number; hips: number; inseam: number; confidence: string; reasoning?: string };
    height?: string;
    usualSizes?: Record<string, string[]>;
  },
) {
  const conf = QUIZ_CONFIDENCE[input.derived.confidence] ?? QUIZ_CONFIDENCE.low;
  const num = (n: any) => (n == null || Number.isNaN(Number(n)) ? undefined : Math.round(Number(n)));
  const payload: Partial<DbMeasurements> = {
    height_in: heightToInches(input.height || '') ?? undefined,
    bust_in: num(input.derived.bust),
    waist_in: num(input.derived.waist),
    hips_in: num(input.derived.hips),
    inseam_in: num(input.derived.inseam),
    source: 'quiz',
    source_confidence: conf,
  } as any;
  if (input.usualSizes && Object.keys(input.usualSizes).length) {
    (payload as any).usual_sizes = input.usualSizes;
  }
  const [mRes] = await Promise.all([
    saveMeasurements(sb, userId, payload),
    sb.from('quiz_results').insert({
      user_id: userId,
      answers: input.answers,
      derived: input.derived,
      confidence: conf,
    }),
  ]);
  return mRes;
}

// Persist a guided (tape) consultation. Tape measurements carry full confidence.
export async function saveConsultationMeasurements(
  sb: SupabaseClient,
  userId: string,
  m: Record<string, any>,
) {
  const num = (n: any) => (n == null || Number.isNaN(Number(n)) ? undefined : Number(n));
  const heightIn = m.height_feet != null
    ? Number(m.height_feet) * 12 + Number(m.height_inches || 0)
    : undefined;
  const usual = buildUsualSizes({
    tops: Array.isArray(m.usual_tops) ? m.usual_tops : [m.usual_tops],
    bottoms: Array.isArray(m.usual_bottoms) ? m.usual_bottoms : [m.usual_bottoms],
    plus: Array.isArray(m.usual_plus) ? m.usual_plus : [m.usual_plus],
  });
  const payload: Partial<DbMeasurements> = {
    height_in: heightIn,
    bust_in: num(m.bust),
    waist_in: num(m.waist),
    hips_in: num(m.hips),
    inseam_in: num(m.inseam),
    shoulder_in: num(m.shoulder_width),
    arm_in: num(m.arm_length),
    torso_in: num(m.torso_length),
    source: 'tape',
    source_confidence: 1.0,
  } as any;
  if (Object.keys(usual).length) (payload as any).usual_sizes = usual;
  return saveMeasurements(sb, userId, payload);
}
