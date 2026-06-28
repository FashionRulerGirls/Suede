'use client';
import React from 'react';
import { Icon } from './Icon';

/* Native-backed select with Suede styling. Used for the nav "Suede for
   Business" menu and portal filters. */

export function Select({ variant = 'outline', size = 'md', children, style, ...rest }: any) {
  const h = size === 'sm' ? 42 : 50;
  const shape = {
    outline: { background: 'var(--surface-card)', border: '1px solid var(--border-default)' },
    filled:  { background: 'var(--linen)', border: '1px solid transparent' },
    plain:   { background: 'transparent', border: 'none' },
  }[variant];
  return (
    <div
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        height: h, borderRadius: 'var(--radius-xs)',
        ...shape, ...style,
      }}
    >
      <select
        style={{
          appearance: 'none', WebkitAppearance: 'none',
          border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-body)', fontSize: 14,
          color: 'var(--text-primary)',
          height: '100%',
          padding: variant === 'plain' ? '0 22px 0 0' : '0 38px 0 14px',
          cursor: 'pointer', width: '100%',
        }}
        {...rest}
      >
        {children}
      </select>
      <span style={{ position: 'absolute', right: variant === 'plain' ? 0 : 12, pointerEvents: 'none', display: 'flex', color: 'var(--text-secondary)' }}>
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
}
