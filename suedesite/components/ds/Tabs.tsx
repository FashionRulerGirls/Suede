'use client';
import React from 'react';

/* Underline tab bar — "Reviews / Inquiries" on The Lookbook, and section
   switches in the portal. Controlled via `value`/`onChange`. */

export function Tabs({ items = [], value, onChange, align = 'left', style, ...rest }: any) {
  const active = value ?? (items[0] && (items[0].value ?? items[0]));
  const norm = items.map((it) => (typeof it === 'string' ? { label: it, value: it } : it));
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border-subtle)',
        justifyContent: align === 'center' ? 'center' : align === 'stretch' ? 'stretch' : 'flex-start',
        ...style,
      }}
      {...rest}
    >
      {norm.map((it) => {
        const on = it.value === active;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange && onChange(it.value)}
            style={{
              flex: align === 'stretch' ? 1 : 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '14px 22px',
              marginBottom: -1,
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              letterSpacing: 'var(--ls-wide)',
              color: on ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: on ? '1.5px solid var(--ink-900)' : '1.5px solid transparent',
              transition: 'color var(--dur-fast) var(--ease-out)',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
