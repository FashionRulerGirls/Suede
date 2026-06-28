'use client';
import React from 'react';
import { Button, Field, Input, Icon } from '@/components/ds';

function SuggestSection({ label, children }: any) {
  return (
    <section style={{ background: 'var(--white)', padding: '32px 40px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)', marginBottom: 18 }}>{label}</div>
      {children}
    </section>
  );
}

export function SuggestBrandScreen({ onRoute }: any) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [why, setWhy] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={30} color="var(--white)" />
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Suggestion received</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          Thank you for suggesting{name.trim() ? ` ${name.trim()}` : ' a brand'}. Our team reviews every submission as we grow The Capsule.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => { setName(''); setUrl(''); setWhy(''); setSubmitted(false); }}>Suggest another</Button>
          <Button variant="primary" onClick={() => onRoute('capsule')}>Back to The Capsule</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 44, color: 'var(--text-heading)', margin: 0 }}>Suggest a Brand</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', marginTop: 14 }}>Suggest a Fashion Brand that you would love to see in The Capsule</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SuggestSection label="Name of the Brand">
          <Input variant="outline" placeholder="e.g. OSA" value={name} onChange={(e: any) => setName(e.target.value)} />
        </SuggestSection>
        <SuggestSection label="Website URL">
          <Input variant="outline" placeholder="https:// example.com" value={url} onChange={(e: any) => setUrl(e.target.value)} />
        </SuggestSection>
        <SuggestSection label="Why should we add this brand in The Capsule?">
          <textarea rows={6} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Tell us what makes this brand worth featuring — their craft, their fit, their point of view."
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
        </SuggestSection>
        <Button variant="primary" fullWidth size="lg" disabled={!name.trim()} onClick={() => setSubmitted(true)}>Submit</Button>
      </div>
    </div>
  );
}
