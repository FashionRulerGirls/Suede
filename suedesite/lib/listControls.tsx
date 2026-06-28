'use client';
import React from 'react';
import { Icon } from '@/components/ds';

function Dropdown({ label, value, options, onChange, icon = 'chevron-down' }) {
  const [open, setOpen] = React.useState(false);
  const current = options.find(o => (o.value ?? o) === value);
  const curLabel = current ? (current.label ?? current) : value;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 14px',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)',
        cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap',
      }}>
        {label && <span style={{ color: 'var(--text-muted)' }}>{label}:</span>}{curLabel}
        <Icon name={icon} size={14} color="var(--text-secondary)" style={{ transition: 'transform var(--dur-base) var(--ease-out)', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}
      <div style={{
        position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 41, minWidth: 180,
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-lg)', padding: 6, opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(-6px)',
        pointerEvents: open ? 'auto' : 'none', transition: 'opacity 150ms var(--ease-out), transform 150ms var(--ease-out)',
      }}>
        {options.map(o => {
          const v = o.value ?? o, l = o.label ?? o;
          return (
            <button key={v} onClick={() => { onChange(v); setOpen(false); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: v === value ? 'var(--linen)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)',
            }}
              onMouseEnter={(e) => { if (v !== value) e.currentTarget.style.background = 'var(--linen)'; }}
              onMouseLeave={(e) => { if (v !== value) e.currentTarget.style.background = 'transparent'; }}>
              {l}{v === value && <Icon name="check" size={14} color="var(--text-primary)" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 42, padding: '0 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
      border: '1px solid', borderColor: active ? 'var(--ink-900)' : 'var(--border-default)',
      background: active ? 'var(--ink-900)' : 'transparent', color: active ? 'var(--white)' : 'var(--text-secondary)',
      fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.02em', whiteSpace: 'nowrap',
      transition: 'all var(--dur-fast) var(--ease-out)',
    }}>{label}</button>
  );
}

function SearchBar({ value, onChange, placeholder, width = 320 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42, width, maxWidth: '100%', padding: '0 14px', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)' }}>
      <Icon name="search" size={17} color="var(--text-muted)" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }} />
      {value && <button onClick={() => onChange('')} aria-label="Clear" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', padding: 0 }}><Icon name="close" size={15} /></button>}
    </div>
  );
}

function CollapsibleToolbar({ children, align = 'space-between' }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
      {open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%', animation: 'suedeToolsIn 240ms var(--ease-out)' }}>
          <style>{`@keyframes suedeToolsIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          {children}
          <button onClick={() => setOpen(false)} aria-label="Close filters" style={{
            width: 42, height: 42, flex: 'none', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
            border: '1px solid var(--border-default)', background: 'var(--surface-card)', color: 'var(--text-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="close" size={17} /></button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 9, height: 42, padding: 0,
          cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.02em',
          transition: 'color var(--dur-fast) var(--ease-out)',
        }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          <Icon name="search" size={16} color="currentColor" />
          Search &amp; Filter
          <Icon name="sliders" size={16} color="currentColor" />
        </button>
      )}
    </div>
  );
}

export const SuedeControls = { Dropdown, FilterChip, SearchBar, CollapsibleToolbar };
export { Dropdown, FilterChip, SearchBar, CollapsibleToolbar };
