'use client';
import React from 'react';
import { Eyebrow } from './Eyebrow';

/* Editorial section header: optional eyebrow, big serif title (often with
   an italic word), and a quiet sans subtitle. Centered by default, like
   "The Lookbook — Real reviews from real bodies." */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  size = 'lg',     // 'md' | 'lg' | 'xl'
  tone = 'default',
  style,
  ...rest
}: any) {
  const titleSize = { md: 32, lg: 48, xl: 64 }[size];
  const inverse = tone === 'inverse';
  return (
    <header
      style={{
        display: 'flex', flexDirection: 'column',
        gap: 16,
        textAlign: align,
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        ...style,
      }}
      {...rest}
    >
      {eyebrow && <Eyebrow tone={inverse ? 'inverse' : 'default'}>{eyebrow}</Eyebrow>}
      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--fw-regular)',
            fontSize: titleSize,
            lineHeight: 'var(--lh-display)',
            letterSpacing: 'var(--ls-tight)',
            color: inverse ? 'var(--white)' : 'var(--text-heading)',
            margin: 0,
            maxWidth: '20ch',
          }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            lineHeight: 'var(--lh-body)',
            color: inverse ? 'rgba(255,255,255,0.74)' : 'var(--text-muted)',
            margin: 0,
            maxWidth: '46ch',
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
