'use client';
import React from 'react';
import { Button, Input, Field, Select, Icon, Logo } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { submitBrandApplication } from '@/lib/contentData';

export function ApplyScreen({ onRoute }: any) {
  const ownership = ['Brand Owner', 'Brand PR / Communications', 'Other'];
  const { user } = useAuth();
  const [own, setOwn] = React.useState('Brand Owner');
  const [ownOpen, setOwnOpen] = React.useState(false);
  const [ownOther, setOwnOther] = React.useState('');
  const [why, setWhy] = React.useState('');
  const [brandName, setBrandName] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [foundingYear, setFoundingYear] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const submitApplication = async () => {
    const e: string[] = [];
    if (!brandName.trim()) e.push('Enter your brand name');
    if (!website.trim()) e.push('Add your website');
    if (!email.trim() || !email.includes('@')) e.push('Enter a valid contact email');
    if (!why.trim()) e.push('Tell us why your brand belongs in The Capsule');
    setErrors(e);
    if (e.length) return;
    setSubmitting(true);
    try {
      const sb = createClient();
      if (sb) {
        await submitBrandApplication(sb, {
          brandName, website, email, location,
          ownership: own, ownershipOther: ownOther, foundingYear, pitch: why,
        }, user?.id);
      }
      setSubmitted(true);
    } catch {
      setErrors(['Something went wrong submitting your application. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };
  const points = [
    'Capsule Brands get feautured placement on our Brand Directory page, access to personalized dashboards, and response features to engage directly with Reviews / Inquiries.',
  ];
  if (submitted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={30} color="var(--white)" />
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Application received</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          Thanks for applying to The Capsule. Our Partnerships team reviews every brand and will be in touch at {email || 'your email'}.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => onRoute('capsule')}>Back to The Capsule</Button>
          <Button variant="primary" onClick={() => onRoute('brandsignin')}>Sign in to your brand</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-apply-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 52px 0', display: 'grid', gridTemplateColumns: '420px 1fr', columnGap: 80, rowGap: 8, alignItems: 'start' }}>
      {/* Aside */}
      <aside className="sd-apply-aside" style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 110 }}>
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
      <div className="sd-apply-card" style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Brand name"><Input variant="outline" maxLength={80} value={brandName} onChange={(e: any) => setBrandName(e.target.value)} placeholder="e.g., OSA" /></Field>
          <Field label="Website"><Input variant="outline" maxLength={300} value={website} onChange={(e: any) => setWebsite(e.target.value)} placeholder="https://" /></Field>
          <Field label="Email"><Input variant="outline" maxLength={120} value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="e.g you@gmail.com" /></Field>
          <div className="sd-apply-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Location"><Input variant="outline" maxLength={80} placeholder="City, Country" value={location} onChange={(e: any) => setLocation(e.target.value)} /></Field>
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
          <Field label="Founding year"><Input variant="outline" maxLength={4} inputMode="numeric" placeholder="2019" value={foundingYear} onChange={(e: any) => setFoundingYear(e.target.value)} /></Field>
          {own === 'Other' && (
            <Field label="Please specify your role"><Input variant="outline" maxLength={60} placeholder="e.g. Stylist, Founder's partner" value={ownOther} onChange={(e: any) => setOwnOther(e.target.value)} /></Field>
          )}
          <Field label="Why should your brand be in The Capsule?" hint="A few sentences is plenty.">
            <textarea rows={5} maxLength={600} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Tell us about your Brand and your commitment to Suede's mission"
              style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{why.length} / 600 characters</div>
          </Field>
          {errors.length > 0 && (
            <div role="alert" style={{ background: 'var(--surface-card)', border: '1px solid var(--rating-critical)', borderRadius: 'var(--radius-xs)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--rating-critical)', marginBottom: 8 }}>
                <Icon name="info" size={16} color="var(--rating-critical)" /> Please complete the following:
              </div>
              <ul style={{ margin: 0, paddingLeft: 26, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
                {errors.map((e) => <li key={e} style={{ marginTop: 4 }}>{e}</li>)}
              </ul>
            </div>
          )}
          <div className="sd-apply-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 24 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.4, color: 'var(--ink-500)', maxWidth: 300 }}>By submitting your Capsule application, you agree to be contacted by the Suede Partnerships team.</span>
            <Button variant="primary" onClick={submitApplication} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</Button>
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
