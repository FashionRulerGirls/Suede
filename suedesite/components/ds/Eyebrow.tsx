'use client';
import React from 'react';

/* Letter-spaced uppercase serif tick that sits above titles
   ("HOW IT WORKS", "DISCOVERY FEED", "BRAND DIRECTORY"). */

export function Eyebrow({ children, as = 'span', tone = 'default', style, ...rest }: any) {
  const Tag = as;
  return (
    <Tag
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--fw-regular)',
        fontSize: 14,
        letterSpacing: 'var(--ls-wider)',
        textTransform: 'uppercase',
        color: tone === 'inverse' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
