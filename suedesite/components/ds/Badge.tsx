'use client';
import React from 'react';

/* Small status pill. Used for "Active in The Capsule", "Recommended",
   rating deltas, etc. Optional leading status dot. */

const tones = {
  neutral:  { bg: 'var(--linen)',      fg: 'var(--text-secondary)', dot: 'var(--ink-400)' },
  ink:      { bg: 'var(--ink-900)',    fg: 'var(--white)',          dot: 'var(--white)' },
  positive: { bg: 'rgba(63,125,82,0.10)',  fg: 'var(--rating-positive)', dot: 'var(--rating-positive)' },
  critical: { bg: 'rgba(192,70,58,0.10)',  fg: 'var(--rating-critical)', dot: 'var(--rating-critical)' },
  premium:  { bg: 'rgba(201,169,110,0.16)', fg: 'var(--gold-deep)',  dot: 'var(--gold)' },
  accent:   { bg: 'rgba(113,142,191,0.14)', fg: 'var(--denim-ink)',  dot: 'var(--denim)' },
};

export function Badge({ children, tone = 'neutral', dot = false, size = 'md', style, ...rest }: any) {
  const t = tones[tone];
  const sm = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: t.bg, color: t.fg,
        fontFamily: 'var(--font-body)',
        fontSize: sm ? 11 : 12,
        letterSpacing: 'var(--ls-wide)',
        lineHeight: 1,
        padding: sm ? '5px 10px' : '7px 13px',
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flex: 'none' }} />}
      {children}
    </span>
  );
}
