'use client';
import React from 'react';

/* Label + control + helper/error wrapper. Labels are the small sans
   labels seen above auth fields ("Email Address", "Password"). */

export function Field({ label, htmlFor, hint, error, required = false, children, style, ...rest }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, ...style }} {...rest}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-primary)',
            letterSpacing: 'var(--ls-tight)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--rating-critical)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: error ? 'var(--rating-critical)' : 'var(--text-muted)',
          }}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
