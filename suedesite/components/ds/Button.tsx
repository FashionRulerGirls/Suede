'use client';
import React from 'react';
import { Icon } from './Icon';

/* Suede buttons. Default is the sharp black "ink" block from the auth /
   directory CTAs. The "pill" shape is the rounded discovery-feed CTA. */

const sizes = {
  sm: { padding: '0 16px', height: 38, fontSize: 13 },
  md: { padding: '0 24px', height: 48, fontSize: 14 },
  lg: { padding: '0 32px', height: 56, fontSize: 15 },
};

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontFamily: 'var(--font-body)',
  fontWeight: 'var(--fw-regular)',
  letterSpacing: 'var(--ls-wide)',
  lineHeight: 1,
  cursor: 'pointer',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-xs)',
  transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
};

const variants = {
  primary:   { background: 'var(--action-primary)', color: 'var(--action-on-primary)', borderColor: 'var(--action-primary)' },
  secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', borderColor: 'var(--border-strong)' },
  ghost:     { background: 'transparent', color: 'var(--text-primary)', borderColor: 'transparent', textDecoration: 'underline', textUnderlineOffset: 4, letterSpacing: 'var(--ls-wide)', padding: 0 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'square',     // 'square' | 'pill'
  icon,                 // leading Icon name
  trailingIcon,         // trailing Icon name
  fullWidth = false,
  disabled = false,
  as = 'button',
  style,
  ...rest
}: any) {
  const Tag = as;
  const isGhost = variant === 'ghost';
  const s = {
    ...base,
    ...(isGhost ? {} : sizes[size]),
    ...variants[variant],
    ...(shape === 'pill' ? { borderRadius: 'var(--radius-pill)' } : null),
    ...(fullWidth ? { width: '100%' } : null),
    ...(disabled ? { opacity: 0.4, pointerEvents: 'none', cursor: 'default' } : null),
    ...style,
  };
  const isize = size === 'lg' ? 20 : 18;
  return (
    <Tag style={s} disabled={as === 'button' ? disabled : undefined} {...rest}>
      {icon && <Icon name={icon} size={isize} />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} size={isize} />}
    </Tag>
  );
}
