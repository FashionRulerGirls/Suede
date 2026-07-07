'use client';
import React from 'react';
/* Suede marketing-site footer. */
import { Logo, Input, Icon } from '@/components/ds';

export function Footer({ onRoute }: any) {
  const go = (r) => { if (r && onRoute) onRoute(r); };
  const cols = [
    { h: 'About Us', items: [], route: 'about' },
    { h: 'Privacy', items: [], route: 'privacy' },
    { h: 'Suede for Business', items: [{ label: 'Apply', route: 'apply' }, { label: 'Brand Portal', route: 'brandsignin' }] },
    { h: 'Suggest a Brand', items: [], route: 'suggest' },
    { h: 'Navigate', items: [{ label: 'The Capsule | Brand Directory', route: 'capsule' }, { label: 'The Lookbook | Reviews & Inquiries', route: 'lookbook' }, { label: 'The Collective | Member Discovery', route: 'collective' }] },
  ];
  return (
    <footer style={{ background: 'var(--paper)', borderTop: '1px solid var(--border-subtle)', marginTop: 80 }}>
      <div className="sd-footer-inner" style={{ maxWidth: 1460, margin: '0 auto', padding: '64px 52px 36px' }}>
        <div className="sd-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(5, 1fr)', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Logo variant="monogram" height={132} style={{ alignSelf: 'flex-start' }} />
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 15 }}>Sign up for our Newsletter | Per Suede</div>
            <Input variant="underline" placeholder="Email Address" trailingIcon="pen" />
          </div>
          {cols.map(c => (
            <div key={c.h} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div onClick={() => go(c.route)} style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', cursor: c.route ? 'pointer' : 'default' }}>{c.h}</div>
              {c.items.map(it => (
                <div key={it.label} onClick={() => go(it.route)} style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-secondary)', cursor: it.route ? 'pointer' : 'default' }}>{it.label}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 15 }}>Let's Connect!</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-secondary)' }}>info@suedecapsule.com</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--text-muted)' }}>Suede LLC</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)' }}>
            <Icon name="instagram" size={18} />
            <Icon name="tiktok" size={18} />
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 14 }}>@suedecapsule</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
