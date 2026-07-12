'use client';
import React from 'react';
/* Suede — "Complete your profile" progress strip. Shows under the nav for a
   real signed-in member until their profile reaches 100%. */
import { Icon } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadProfileData } from '@/lib/profileData';

const STEPS = [
  { key: 'name', label: 'Add your name', done: (p: any) => !!(p?.display_name && p.display_name.trim()) },
  { key: 'bio', label: 'Add a short bio', done: (p: any) => !!(p?.bio && p.bio.trim()) },
  { key: 'photo', label: 'Add a profile photo', done: (p: any) => !!p?.avatar_url },
  { key: 'measurements', label: 'Add your measurements', done: (_p: any, m: any) => !!(m && m.height_in && m.bust_in && m.waist_in && m.hips_in) },
  { key: 'sizes', label: 'Add your usual sizes', done: (_p: any, m: any) => !!(m && m.usual_sizes && Object.keys(m.usual_sizes).length) },
];

export function ProfileProgress({ route, onRoute }: any) {
  const { user } = useAuth();
  const [data, setData] = React.useState<any>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const completeRef = React.useRef(false);

  const reload = React.useCallback(() => {
    const sb = createClient();
    if (!sb || !user) { setData(null); setLoaded(true); return; }
    loadProfileData(sb, user.id)
      .then((d) => { setData(d); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [user?.id]);

  // Reload on sign-in, on navigation (so it reflects edits/quiz/consultation),
  // and when a screen signals a save. Stops querying once complete.
  React.useEffect(() => { if (!completeRef.current) reload(); }, [reload, route]);
  React.useEffect(() => {
    const h = () => reload();
    window.addEventListener('suede-profile-updated', h);
    return () => window.removeEventListener('suede-profile-updated', h);
  }, [reload]);

  if (!user || !loaded || dismissed || route === 'editprofile' || !data?.profile) return null;
  const p = data.profile, m = data.measurements;
  const results = STEPS.map((s) => ({ ...s, ok: s.done(p, m) }));
  const done = results.filter((s) => s.ok).length;
  const pct = Math.round((done / STEPS.length) * 100);
  if (pct >= 100) { completeRef.current = true; return null; }
  const next = results.find((s) => !s.ok);

  return (
    <div className="sd-profile-progress" style={{ background: 'var(--surface-card)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="sd-pp-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
            <span className="sd-pp-label" style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--text-primary)' }}>
              Complete your profile{next && <span style={{ color: 'var(--text-muted)' }}> — next: {next.label}</span>}
            </span>
            <span style={{ fontFamily: 'var(--font-meta, var(--font-body))', fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{done} / {STEPS.length} · {pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: 'var(--ink-100, var(--border-subtle))', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--ink-900)', borderRadius: 999, transition: 'width var(--dur-slow) var(--ease-out)' }} />
          </div>
        </div>
        <button onClick={() => onRoute('editprofile')} className="sd-pp-btn" style={{ flex: 'none', height: 38, padding: '0 18px', background: 'var(--ink-900)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
          Finish setup
        </button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" style={{ flex: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', padding: 4 }}>
          <Icon name="close" size={16} color="var(--text-muted)" />
        </button>
      </div>
    </div>
  );
}
