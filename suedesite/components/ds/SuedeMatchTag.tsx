'use client';
import React from 'react';

/* Suede Match tag — a small "● Suede Match" pill that reveals a short, plain
   explainer on hover: the % (how close this member's body is to yours) and a
   one-line note on how reliable that is (confidence). */

type Match = { score?: number | null; confidence?: string } | null | undefined;

const dotColor = (c?: string) =>
  c === 'high' ? 'var(--rating-positive)' : c === 'medium' ? 'var(--denim)' : c === 'low' ? 'var(--text-muted)' : 'var(--rating-positive)';

const closeness = (score?: number | null) => {
  if (score == null) return 'similar';
  if (score >= 85) return 'very close';
  if (score >= 70) return 'close';
  if (score >= 50) return 'fairly close';
  return 'not very close';
};

// One short confidence line (with the reason folded in).
const confLine = (c?: string) =>
  c === 'medium'
    ? 'Medium confidence — one of you used estimated sizes.'
    : c === 'low'
    ? 'Lower confidence — based on limited measurements.'
    : 'High confidence — you both entered precise measurements.';

export function SuedeMatchTag({ match, align = 'right' }: { match?: Match; align?: 'left' | 'right' }) {
  const conf = match?.confidence;
  const score = match?.score;
  const show = (e: React.MouseEvent, on: boolean) => {
    const t = e.currentTarget.querySelector('[data-tip]') as HTMLElement | null;
    if (t) { t.style.opacity = on ? '1' : '0'; t.style.pointerEvents = on ? 'auto' : 'none'; }
  };
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={(e) => show(e, true)}
      onMouseLeave={(e) => show(e, false)}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.02em', color: 'var(--text-muted)', cursor: 'help' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor(conf), flex: 'none' }} />Suede Match
      </span>
      <span
        data-tip
        className="sd-match-pop"
        style={{
          position: 'absolute', top: 'calc(100% + 8px)', ...(align === 'right' ? { right: 0 } : { left: 0 }),
          width: 240, whiteSpace: 'normal', textAlign: 'left',
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)',
          padding: '14px 16px', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 30,
        }}
      >
        {score != null ? (
          <>
            <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.05, color: 'var(--text-heading)' }}>{score}% match</span>
            <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
              Their measurements are {closeness(score)} to yours.
            </span>
          </>
        ) : (
          <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            How close this member’s measurements are to yours.
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45, marginTop: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor(conf), flex: 'none' }} />
          {confLine(conf)}
        </span>
      </span>
    </span>
  );
}
