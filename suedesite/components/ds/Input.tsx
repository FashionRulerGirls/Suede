'use client';
import React from 'react';
import { Icon } from './Icon';

/* Text input. Three Suede shapes:
   - "filled"     soft linen box (auth forms)
   - "outline"    hairline box (portal forms)
   - "underline"  single rule, transparent (newsletter / inline) */

export function Input({
  variant = 'filled',
  size = 'md',
  icon,
  type = 'text',
  invalid = false,
  trailingIcon,
  onTrailingClick,
  style,
  ...rest
}: any) {
  const h = size === 'sm' ? 42 : size === 'lg' ? 56 : 50;
  const pad = variant === 'underline' ? 0 : 16;

  const shape = {
    filled:    { background: 'var(--linen)', border: '1px solid transparent', borderRadius: 'var(--radius-xs)' },
    outline:   { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)' },
    underline: { background: 'transparent', border: 'none', borderBottom: '1px solid var(--ink-900)', borderRadius: 0 },
  }[variant];

  if (invalid) shape.border = '1px solid var(--rating-critical)';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: h,
        padding: `0 ${pad}px`,
        transition: 'border-color var(--dur-fast) var(--ease-out)',
        ...shape,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={18} color="var(--text-muted)" />}
      <input
        type={type}
        style={{
          flex: 1, minWidth: 0,
          border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--text-primary)',
          height: '100%',
        }}
        {...rest}
      />
      {trailingIcon && (
        <button
          type="button"
          onClick={onTrailingClick}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}
        >
          <Icon name={trailingIcon} size={18} />
        </button>
      )}
    </div>
  );
}
