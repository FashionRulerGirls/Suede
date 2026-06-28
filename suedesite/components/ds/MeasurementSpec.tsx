'use client';
import React from 'react';

/* Body-measurement spec line — Suede's fit-trust signature.
   Renders "H: 5'5" / B: 33" / W: 29" / H: 40"" in the condensed grotesque.
   Pass any subset; order is fixed (Height, Bust, Waist, Hips). */

export function MeasurementSpec({
  height,
  bust,
  waist,
  hips,
  size = 'md',     // 'sm' | 'md'
  tone = 'default',// 'default' | 'muted'
  style,
  ...rest
}: any) {
  const parts = [
    ['', height],
    ['B', bust],
    ['W', waist],
    ['H', hips],
  ].filter(([, v]) => v != null && v !== '');

  const fs = size === 'sm' ? 12 : 13.6;
  const color = tone === 'muted' ? 'var(--text-muted)' : 'var(--text-secondary)';

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
        fontFamily: 'var(--font-meta)',
        fontWeight: 'var(--fw-medium)',
        fontSize: fs,
        letterSpacing: 'var(--ls-wide)',
        color,
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {parts.map(([k, v], i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: 'var(--ink-200)' }}>/</span>}
          <span>{k && <span style={{ color: 'var(--text-primary)' }}>{k}:</span>} {v}</span>
        </React.Fragment>
      ))}
    </span>
  );
}
