'use client';
import React from 'react';
import { Icon } from './Icon';

/* Square checkbox ("Remember me"). Filled ink when checked. */

export function Checkbox({ checked = false, onChange, label, disabled = false, id, style, ...rest }: any) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked, e)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          width: 18, height: 18, flex: 'none',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid',
          borderColor: checked ? 'var(--ink-900)' : 'var(--border-default)',
          background: checked ? 'var(--ink-900)' : 'var(--surface-card)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}
      >
        {checked && <Icon name="check" size={13} color="var(--white)" stroke={2.4} />}
      </span>
      {label && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      )}
    </label>
  );
}
