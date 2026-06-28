'use client';
import React from 'react';

/* Generic surface container. Suede surfaces are crisp: hairline border or
   a whisper shadow, near-square corners. */

export function Card({ children, elevation = 'flat', padding = 'md', radius = 'sm', as = 'div', style, ...rest }: any) {
  const Tag = as;
  const pad = { none: 0, sm: 16, md: 24, lg: 32 }[padding] ?? padding;
  const rad = { none: 0, xs: 'var(--radius-xs)', sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' }[radius];
  const elev = {
    flat:   { boxShadow: 'none', border: '1px solid var(--border-subtle)' },
    raised: { boxShadow: 'var(--shadow-card)', border: 'none' },
    inset:  { boxShadow: 'none', border: 'none', background: 'var(--surface-inset)' },
  }[elevation];
  return (
    <Tag
      style={{
        background: 'var(--surface-card)',
        borderRadius: rad,
        padding: pad,
        ...elev,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
