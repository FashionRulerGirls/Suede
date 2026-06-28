'use client';
import React from 'react';
import { Button, Input, Field, Select, Icon, Logo } from '@/components/ds';

export function ApplyScreen({ onRoute }: any) {
  const ownership = ['Brand Owner', 'Brand PR / Communications', 'Other'];
  const [own, setOwn] = React.useState('Brand Owner');
  const [ownOpen, setOwnOpen] = React.useState(false);
  const [ownOther, setOwnOther] = React.useState('');
  const points = [
    'Capsule Brands get feautured placement on our Brand Directory page, access to personalized dashboards, and response features to engage directly with Reviews / Inquiries.',
  ];
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 52px 0', display: 'grid', gridTemplateColumns: '420px 1fr', columnGap: 80, rowGap: 8, alignItems: 'start' }}>
      {/* Aside */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 110 }}>
        <Logo variant="monogram" height={52} style={{ alignSelf: 'flex-start' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.165em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>Apply</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', color: '#111114', margin: 0 }}>Join the Capsule</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0 }}>
          We spotlight emerging brands, with a strong focus on minority-owned brands, that deserve attention and are committed to building customer trust and loyalty.
        </p>
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {points.map((p, i) => (
            <div key={p} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-500)' }}>{i === 0 ? p : `· ${p}`}</div>
          ))}
        </div>
      </aside>

      {/* Form card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Brand name"><Input variant="outline" placeholder="e.g., OSA" /></Field>
          <Field label="Website"><Input variant="outline" placeholder="https://" /></Field>
          <Field label="Email"><Input variant="outline" placeholder="e.g you@gmail.com" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Location"><Input variant="outline" placeholder="City, Country" /></Field>
            <Field label="Ownership / identity">
              <div style={{ position: 'relative' }}>
                <button type="button" onClick={() => setOwnOpen(o => !o)} style={{
                  width: '100%', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)',
                  padding: '0 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)',
                }}>
                  {own}
                  <Icon name="chevron-down" size={16} color="var(--text-secondary)" style={{ transition: 'transform var(--dur-base) var(--ease-out)', transform: ownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {ownOpen && <div onClick={() => setOwnOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 41,
                  background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: 6,
                  transition: 'opacity 150ms var(--ease-out), transform 150ms var(--ease-out)',
                  opacity: ownOpen ? 1 : 0, transform: ownOpen ? 'translateY(0)' : 'translateY(-6px)',
                  pointerEvents: ownOpen ? 'auto' : 'none',
                }}>
                  {ownership.map(o => (
                    <button key={o} type="button" onClick={() => { setOwn(o); setOwnOpen(false); }} style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 12px', borderRadius: 'var(--radius-xs)', border: 'none',
                      background: own === o ? 'var(--linen)' : 'transparent', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)',
                    }}
                      onMouseEnter={(e) => { if (own !== o) e.currentTarget.style.background = 'var(--linen)'; }}
                      onMouseLeave={(e) => { if (own !== o) e.currentTarget.style.background = 'transparent'; }}>
                      {o}
                      {own === o && <Icon name="check" size={15} color="var(--text-primary)" />}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>
          <Field label="Founding year"><Input variant="outline" placeholder="2019" /></Field>
          {own === 'Other' && (
            <Field label="Please specify your role"><Input variant="outline" placeholder="e.g. Stylist, Founder's partner" value={ownOther} onChange={(e: any) => setOwnOther(e.target.value)} /></Field>
          )}
          <Field label="Why should your brand be in The Capsule?" hint="A few sentences is plenty.">
            <textarea rows={5} placeholder="Tell us about your Brand and your commitment to Suede's mission"
              style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 24 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.4, color: 'var(--ink-500)', maxWidth: 300 }}>By submitting your Capsule application, you agree to be contacted by the Suede Partnerships team.</span>
            <Button variant="primary" onClick={() => onRoute('brandsignin')}>Submit application</Button>
          </div>
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1', textAlign: 'right', padding: '2px 0 40px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(26,26,26,0.5)' }}>
          Already apart of the Capsule? <button onClick={() => onRoute('brandsignin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Sign in or claim your brand</button>
        </span>
      </div>
    </div>
  );
}
