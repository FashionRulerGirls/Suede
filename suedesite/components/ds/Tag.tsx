'use client';
import React from 'react';

/* Lightweight categorical chip — capsule categories, filters, product
   attributes. Quieter than Badge: hairline outline, uppercase micro-label. */

export function Tag({ children, active = false, as = 'span', style, ...rest }: any) {
  const Tag = as;
  return (
    <Tag
      style={{
        display: 'inline-flex', alignItems: 'center',
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        letterSpacing: 'var(--ls-wider)',
        textTransform: 'uppercase',
        lineHeight: 1,
        padding: '8px 14px',
        borderRadius: 'var(--radius-xs)',
        border: '1px solid',
        cursor: as === 'button' ? 'pointer' : 'default',
        transition: 'all var(--dur-fast) var(--ease-out)',
        background: active ? 'var(--ink-900)' : 'transparent',
        color: active ? 'var(--white)' : 'var(--text-secondary)',
        borderColor: active ? 'var(--ink-900)' : 'var(--border-default)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
