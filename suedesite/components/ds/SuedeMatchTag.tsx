'use client';
import React from 'react';

/* Suede Match tag — a small "● Suede Match" pill that reveals a plain-language
   explainer on hover. It communicates the two things the score encodes:
     • the % = how closely this member's measurements match yours
     • the dot colour = how reliable that match is (confidence) */

type Match = { score?: number | null; confidence?: string } | null | undefined;

const dotColor = (c?: string) =>
  c === 'high' ? 'var(--rating-positive)' : c === 'medium' ? 'var(--denim)' : c === 'low' ? 'var(--text-muted)' : 'var(--rating-positive)';
const confWord = (c?: string) =>
  c === 'high' ? 'High' : c === 'medium' ? 'Medium' : c === 'low' ? 'Low' : 'High';
const confBlurb = (c?: string) =>
  c === 'medium'
    ? 'At least one of your measurements is estimated, so use this as a guide.'
    : c === 'low'
    ? 'Based on limited measurements — treat it as a rough guide.'
    : 'Both profiles have precise, self-measured sizes.';

export function SuedeMatchTag({ match, align = 'right' }: { match?: Match; align?: 'left' | 'right' }) {
  const conf = match?.confidence;
  const score = match?.score;
  const show = (e: React.MouseEvent, on: boolean) => {
    const t = e.currentTarget.querySelector('[data-tip]') as HTMLElement | null;
    if (t) { t.style.opacity = on ? '1' : '0'; t.style.pointerEvents = on ? 'auto' : 'none'; }
  };
  const legendDot = (c: string, label: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor(c) }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
    </span>
  );
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
          width: 258, whiteSpace: 'normal', textAlign: 'left',
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)',
          padding: '14px 16px', opacity: 0, pointerEvents: 'none', transition: 'opacity var(--dur-base) var(--ease-out)', zIndex: 30,
        }}
      >
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Suede Match</span>
        {score != null && (
          <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.05, color: 'var(--text-heading)' }}>{score}%</span>
        )}
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: score != null ? 4 : 0 }}>
          How closely this member’s bust, waist, hips &amp; height match yours.
        </span>
        <span style={{ display: 'block', height: 1, background: 'var(--border-subtle)', margin: '12px 0' }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor(conf) }} />{confWord(conf)} confidence
        </span>
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 10px' }}>
          {confBlurb(conf)}
        </span>
        <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {legendDot('high', 'High')}
          {legendDot('medium', 'Medium')}
          {legendDot('low', 'Low')}
        </span>
      </span>
    </span>
  );
}
