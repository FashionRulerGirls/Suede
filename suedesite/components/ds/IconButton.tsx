'use client';
import React from 'react';
import { Icon } from './Icon';

/* Circular / square icon-only control — search, bell, menu in the nav,
   plus the notification bell chip on the Brand Portal. */

const sizeMap = { sm: 34, md: 40, lg: 48 };

export function IconButton({
  icon,
  size = 'md',
  variant = 'plain',   // 'plain' | 'soft' | 'ink' | 'outline'
  shape = 'circle',    // 'circle' | 'square'
  label,
  style,
  ...rest
}: any) {
  const dim = sizeMap[size];
  const variants = {
    plain:   { background: 'transparent', color: 'var(--text-primary)', border: '1px solid transparent' },
    soft:    { background: 'var(--linen)', color: 'var(--text-primary)', border: '1px solid transparent' },
    ink:     { background: 'var(--ink-900)', color: 'var(--white)', border: '1px solid var(--ink-900)' },
    outline: { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' },
  };
  return (
    <button
      aria-label={label}
      title={label}
      style={{
        width: dim, height: dim,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: shape === 'circle' ? 'var(--radius-pill)' : 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={size === 'lg' ? 22 : 18} />
    </button>
  );
}
