'use client';
import React from 'react';

/* Circular avatar with optional name + @handle, as used on review cards
   and the Brand Portal. Falls back to an initial on the linen fill. */

const dims = { xs: 28, sm: 36, md: 44, lg: 56, xl: 72 };

export function Avatar({
  src,
  name = '',
  handle,
  size = 'md',
  ring = false,
  showName = false,
  style,
  ...rest
}: any) {
  const d = dims[size] || size;
  const initial = name ? name.trim().charAt(0).toUpperCase() : '';
  const img = (
    <span
      style={{
        width: d, height: d, flex: 'none',
        borderRadius: 'var(--radius-pill)',
        overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--linen)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
        fontSize: d * 0.42,
        border: ring ? '2px solid var(--white)' : 'none',
        boxShadow: ring ? '0 0 0 1px var(--border-subtle)' : 'none',
      }}
    >
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
    </span>
  );
  if (!showName) return React.cloneElement(img, { ...rest, style: { ...img.props.style, ...style } });
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, ...style }} {...rest}>
      {img}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.1 }}>{name}</span>
        {handle && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 'var(--ls-wide)' }}>{handle}</span>}
      </span>
    </span>
  );
}
