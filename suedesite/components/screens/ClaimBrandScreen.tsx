'use client';
import React from 'react';
import { Button, Input, Field, Icon, Logo } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { appState } from '@/lib/appState';
import { createClient } from '@/lib/supabase/client';
import { loadBrands, submitBrandClaim } from '@/lib/contentData';
import { SUEDE_BRANDS } from '@/lib/data';

// A small dropdown, styled like the Apply form's ownership picker.
function Dropdown({ value, placeholder, options, onSelect }: any) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)',
        padding: '0 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14,
        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
      }}>
        {value || placeholder}
        <Icon name="chevron-down" size={16} color="var(--text-secondary)" style={{ transition: 'transform var(--dur-base) var(--ease-out)', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}
      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 41, maxHeight: 280, overflowY: 'auto',
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)', padding: 6,
        }}>
          {options.map((o: string) => (
            <button key={o} type="button" onClick={() => { onSelect(o); setOpen(false); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 12px', borderRadius: 'var(--radius-xs)', border: 'none',
              background: value === o ? 'var(--linen)' : 'transparent', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)',
            }}
              onMouseEnter={(e) => { if (value !== o) e.currentTarget.style.background = 'var(--linen)'; }}
              onMouseLeave={(e) => { if (value !== o) e.currentTarget.style.background = 'transparent'; }}>
              {o}
              {value === o && <Icon name="check" size={15} color="var(--text-primary)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClaimBrandScreen({ onRoute }: any) {
  const { user } = useAuth();
  const roles = ['Founder / Owner', 'PR / Communications', 'Team member', 'Other'];
  // Brand list: prefer live DB brands, fall back to the seed list offline.
  const [brands, setBrands] = React.useState<{ name: string; id?: string; shopUrl?: string }[]>(
    (SUEDE_BRANDS || []).map((b: any) => ({ name: b.name }))
  );
  React.useEffect(() => {
    const sb = createClient(); if (!sb) return;
    let alive = true;
    loadBrands(sb).then((bs) => {
      if (alive && bs?.length) setBrands(bs.map((b: any) => ({ name: b.name, id: b._id || b.id, shopUrl: b.shopUrl })));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const preselect = appState.claimBrand?.name || appState.brand?.name || '';
  const [brandName, setBrandName] = React.useState(preselect);
  const [role, setRole] = React.useState('Founder / Owner');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [instagram, setInstagram] = React.useState('');
  const [note, setNote] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<{ domainMatch: boolean } | null>(null);

  const selected = brands.find((b) => b.name === brandName);
  const brandHost = (() => {
    let s = (selected?.shopUrl || '').trim().toLowerCase();
    if (!s) return '';
    if (!/^https?:\/\//.test(s)) s = 'https://' + s;
    try { return new URL(s).hostname.replace(/^www\./, ''); } catch { return ''; }
  })();

  const submit = async () => {
    const e: string[] = [];
    if (!brandName.trim()) e.push('Select your brand');
    if (!name.trim()) e.push('Enter your name');
    if (!email.trim() || !email.includes('@')) e.push('Enter a valid work email');
    setErrors(e);
    if (e.length) return;
    setSubmitting(true);
    try {
      const sb = createClient();
      let res = { domainMatch: false };
      if (sb) {
        res = await submitBrandClaim(sb, {
          brandId: selected?.id || null, brandName, claimantName: name,
          role, workEmail: email, instagram, note, shopUrl: selected?.shopUrl || null,
        }, user?.id);
      }
      setDone(res);
    } catch {
      setErrors(['Something went wrong submitting your claim. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={30} color="var(--white)" />
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 40, color: 'var(--text-heading)', margin: 0 }}>Claim submitted</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', margin: 0, maxWidth: 500, lineHeight: 1.6 }}>
          {done.domainMatch
            ? <>Your email matches <b>{brandName}</b>’s domain, so this should be a quick approval. We’ll confirm at {email} and hand over the keys to your brand page.</>
            : <>Thanks — we’ll verify that you represent <b>{brandName}</b> and follow up at {email}. Adding your brand’s Instagram or a work email at your brand’s domain speeds this up.</>}
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => onRoute('capsule')}>Back to The Capsule</Button>
          <Button variant="primary" onClick={() => onRoute('brandsignin')}>Brand sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-apply-wrap" style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 52px 0', display: 'grid', gridTemplateColumns: '420px 1fr', columnGap: 80, rowGap: 8, alignItems: 'start' }}>
      {/* Aside */}
      <aside className="sd-apply-aside" style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 110 }}>
        <Logo variant="monogram" height={52} style={{ alignSelf: 'flex-start' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.165em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>Claim your brand</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', color: '#111114', margin: 0 }}>Access the Capsule</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-500)', margin: 0 }}>
          Already listed on Suede? Claim your brand to manage your page, respond to reviews and inquiries, and see how shoppers are engaging with you.
        </p>
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6 }}>
          To protect brands, every claim is verified. The fastest route is a work email at your brand’s own domain — otherwise our team confirms it by hand.
        </div>
      </aside>

      {/* Form card */}
      <div className="sd-apply-card" style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Which brand are you claiming?">
            <Dropdown value={brandName} placeholder="Select your brand" options={brands.map((b) => b.name)} onSelect={setBrandName} />
          </Field>
          <div className="sd-apply-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Your name"><Input variant="outline" maxLength={80} value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Full name" /></Field>
            <Field label="Your role"><Dropdown value={role} placeholder="Select role" options={roles} onSelect={setRole} /></Field>
          </div>
          <Field label="Work email" hint={brandHost ? `Use an email at @${brandHost} to verify instantly.` : 'A work email at your brand’s domain verifies you fastest.'}>
            <Input variant="outline" maxLength={120} value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder={brandHost ? `you@${brandHost}` : 'you@yourbrand.com'} />
          </Field>
          <Field label="Brand Instagram (optional)" hint="Helps us confirm you if you don’t have a branded email.">
            <Input variant="outline" maxLength={60} value={instagram} onChange={(e: any) => setInstagram(e.target.value)} placeholder="@yourbrand" />
          </Field>
          <Field label="Anything else? (optional)">
            <textarea rows={4} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Links, your title, or anything that helps us verify you"
              style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{note.length} / 500 characters</div>
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
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.4, color: 'var(--ink-500)', maxWidth: 320 }}>By claiming, you confirm you’re authorized to represent this brand. False claims are removed.</span>
            <Button variant="primary" onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit claim'}</Button>
          </div>
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1', textAlign: 'right', padding: '2px 0 40px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(26,26,26,0.5)' }}>
          Not listed yet? <button onClick={() => onRoute('apply')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Apply to The Capsule</button>
        </span>
      </div>
    </div>
  );
}
