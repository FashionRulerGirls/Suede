'use client';
import React from 'react';
import { Button, Field, Input } from '@/components/ds';

function SuggestSection({ label, children }: any) {
  return (
    <section style={{ background: 'var(--white)', padding: '32px 40px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', marginBottom: 18 }}>{label}</div>
      {children}
    </section>
  );
}

export function SuggestBrandScreen({ onRoute }: any) {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 44, color: 'var(--text-heading)', margin: 0 }}>Suggest a Brand</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', marginTop: 14 }}>Suggest a Fashion Brand that you would love to see in The Capsule</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SuggestSection label="Name of the Brand">
          <Input variant="outline" placeholder="e.g. OSA" />
        </SuggestSection>
        <SuggestSection label="Website URL">
          <Input variant="outline" placeholder="https:// example.com" />
        </SuggestSection>
        <SuggestSection label="Why should we add this brand in The Capsule?">
          <textarea rows={6} placeholder="Tell us what makes this brand worth featuring — their craft, their fit, their point of view."
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
        </SuggestSection>
        <Button variant="primary" fullWidth size="lg" onClick={() => onRoute('capsule')}>Submit</Button>
      </div>
    </div>
  );
}
