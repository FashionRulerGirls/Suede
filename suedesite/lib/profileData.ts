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
    sb.from('profiles').select('*').eq('id', userId).single(),
    sb.from('measurements').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  return {
    profile: (profile as DbProfile) ?? null,
    measurements: (measurements as DbMeasurements) ?? null,
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
  return sb.from('measurements').upsert(
    { user_id: userId, ...m, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
}
