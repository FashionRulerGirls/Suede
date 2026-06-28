'use client';
import React from 'react';
import { MeasurementSpec, Icon } from '@/components/ds';

export function FullMeasureRow({ base = {}, extra = {}, sizes = {}, align = 'flex-start' }: any) {
  const [open, setOpen] = React.useState(false);
  const entries = Object.entries(extra).filter(([, v]) => v) as [string, any][];
  const sizeEntries = Object.entries(sizes).filter(([, v]: any) => v && v.length) as [string, any][];
  const hasMore = entries.length > 0 || sizeEntries.length > 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <MeasurementSpec {...base} />
        {hasMore && (
          <button onClick={() => setOpen((o) => !o)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {open ? 'Hide full info' : 'See full measurement info'}
            <Icon name="chevron-down" size={13} color="var(--text-secondary)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast) var(--ease-out)' }} />
          </button>
        )}
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 2 }}>
          {entries.length > 0 && (
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              {entries.map(([k, v]) => (
                <span key={k} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span> {v}
                </span>
              ))}
            </div>
          )}
          {sizeEntries.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: entries.length ? '1px solid var(--border-subtle)' : 'none', paddingTop: entries.length ? 12 : 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Usual Sizes</span>
              <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                {sizeEntries.map(([k, v]) => (
                  <span key={k} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span> {Array.isArray(v) ? v.join(', ') : v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
