'use client';
import React from 'react';

/* The nav auth toggle — a single pill holding "Sign In" and "Create Account",
   the active segment filled ink, the inactive muted. Also works as a generic
   2-up segmented control. */

export function AuthToggle({
  options = ['Sign In', 'Create Account'],
  value,
  onChange,
  size = 'md',     // 'sm' | 'md'
  style,
  ...rest
}: any) {
  const active = value ?? options[0];
  const pad = size === 'sm' ? '7px 16px' : '9px 22px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        background: 'var(--linen)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-pill)',
        padding: 3,
        ...style,
      }}
      {...rest}
    >
      {options.map((opt) => {
        const on = opt === active;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={on}
            onClick={() => onChange && onChange(opt)}
            style={{
              padding: pad,
              fontFamily: 'var(--font-body)',
              fontSize: fs,
              letterSpacing: 'var(--ls-wide)',
              lineHeight: 1,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-pill)',
              background: on ? 'var(--ink-900)' : 'transparent',
              color: on ? 'var(--white)' : 'var(--text-muted)',
              transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
              whiteSpace: 'nowrap',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
