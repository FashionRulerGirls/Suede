'use client';
import React from 'react';
import { Icon } from './Icon';

/* Brand Portal metric tile — label, soft icon chip, big number with an
   optional unit suffix, and a quiet sublabel. */

export function StatCard({
  label,
  value,
  suffix,
  sublabel,
  icon,
  bordered = true,
  style,
  ...rest
}: any) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 18,
        padding: 24,
        background: 'var(--surface-card)',
        border: bordered ? '1px solid var(--border-subtle)' : 'none',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      {icon && (
        <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'var(--linen)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
          <Icon name={icon} size={19} />
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 40, fontWeight: 'var(--fw-regular)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
        {suffix && <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)' }}>{suffix}</span>}
      </div>
      {sublabel && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>{sublabel}</span>}
    </div>
  );
}
