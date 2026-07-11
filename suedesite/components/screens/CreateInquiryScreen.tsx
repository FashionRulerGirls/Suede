'use client';
/* Suede — Submit an Inquiry (create) page. */
import React from 'react';
import { Button, Field, Input, Icon, Select } from '@/components/ds';
import { appState } from '@/lib/appState';
import { SignInGate } from '@/components/screens/SignInGate';
import { ProductFetch } from '@/components/screens/ProductFetch';

function CISectionCard({ title, children }: any) {
  return (
    <section className="sd-form-card" style={{ background: 'var(--white)', padding: '32px 40px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--text-heading)', margin: '0 0 22px' }}>{title}</h2>
      {children}
    </section>
  );
}

export function CreateInquiryScreen({ onRoute, authed = false }: any) {
  const [scale, setScale] = React.useState('Letter');
  const [size, setSize] = React.useState('');
  const [otherSize, setOtherSize] = React.useState('');
  const [detail, setDetail] = React.useState('');
  const chip = (active: any) => ({
    padding: '13px 0', textAlign: 'center' as any, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink-900)' : 'var(--border-default)'}`,
    background: active ? 'var(--ink-900)' : 'transparent', color: active ? 'var(--white)' : 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--dur-fast) var(--ease-out)',
  });
  if (!authed) return <SignInGate onRoute={onRoute} title="Leave an Inquiry" message="Sign in to ask the community about fit, sizing, and quality before you buy." />;
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '60px 24px 36px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Submit an Inquiry</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginTop: 10, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>Looking for fit intel before you buy? Post a request and get notified when someone reviews the item in your size.</p>
      </div>

      <div className="sd-form-wrap" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <CISectionCard title="Product Information">
          <Field label="Paste the product link">
            <ProductFetch placeholder="https://example.com/product" />
          </Field>
          <Field label="Category (Optional)"><Select variant="outline" defaultValue=""><option value="" disabled>Select a category</option>{['Tops', 'Bottoms', 'Dresses', 'Outerwear'].map(c => <option key={c}>{c}</option>)}</Select></Field>
        </CISectionCard>

        <CISectionCard title="What size(s) are you looking for?">
          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            {['Letter', 'Numeric / Waist', 'Plus'].map(s => (
              <button key={s} type="button" onClick={() => { setScale(s); setSize(''); }} style={{ ...chip(scale === s), padding: '12px 22px' }}>{s}</button>
            ))}
          </div>
          {scale === 'Letter' && (
            <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 12 }}>
              {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
            </div>
          )}
          {scale === 'Numeric / Waist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>US dress / clothing size</div>
                <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 10 }}>
                  {['00', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>Waist size (inches) — for bottoms &amp; denim</div>
                <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 10 }}>
                  {['24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
                </div>
              </div>
            </div>
          )}
          {scale === 'Plus' && (
            <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {['0X', '1X', '2X', '3X', '4X', '5X', '6X'].map(s => <button key={s} type="button" onClick={() => setSize(s)} style={chip(size === s)}>{s}</button>)}
            </div>
          )}
          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '22px 0 16px' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>Other / brand-specific:</div>
          <Input variant="outline" maxLength={24} value={otherSize} onChange={(e: any) => setOtherSize(e.target.value)} placeholder="e.g, 1, 2, 3..." />
        </CISectionCard>

        <CISectionCard title="Tell us more about your inquiry">
          <textarea rows={5} maxLength={500} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="e.g., Planning to wear this to a wedding — need to know if it's flattering on curvy body types!"
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{detail.length} / 500 characters</div>
        </CISectionCard>

        <Button variant="primary" fullWidth size="lg" onClick={() => { appState.lookbookTab = 'inquiries'; onRoute('lookbook'); }}>Submit Inquiry</Button>
      </div>
    </div>
  );
}
