'use client';
import React from 'react';
/* Suede marketing-site footer. */
import { Logo, Input, Icon } from '@/components/ds';
import { createClient } from '@/lib/supabase/client';
import { subscribeNewsletter, submitFeedback } from '@/lib/contentData';

export function Footer({ onRoute }: any) {
  const go = (r) => { if (r && onRoute) onRoute(r); };
  const [email, setEmail] = React.useState('');
  const [newsState, setNewsState] = React.useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const subscribe = async () => {
    const e = email.trim();
    if (!e || !e.includes('@')) { setNewsState('error'); return; }
    setNewsState('busy');
    try {
      const sb = createClient();
      if (sb) await subscribeNewsletter(sb, e);
      setNewsState('done');
    } catch {
      setNewsState('error');
    }
  };
  const [fb, setFb] = React.useState('');
  const [fbState, setFbState] = React.useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const sendFeedback = async () => {
    const m = fb.trim();
    if (!m) { setFbState('error'); return; }
    setFbState('busy');
    try {
      const sb = createClient();
      if (sb) await submitFeedback(sb, m);
      setFbState('done');
    } catch {
      setFbState('error');
    }
  };
  const cols = [
    { h: 'About Us', items: [], route: 'about' },
    { h: 'Privacy', items: [{ label: 'Terms of Service', route: 'terms' }], route: 'privacy' },
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
            {newsState === 'done' ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
                <Icon name="check" size={16} color="var(--rating-positive)" /> You&rsquo;re on the list — thank you.
              </div>
            ) : (
              <>
                <Input variant="underline" maxLength={120} placeholder="Email Address" trailingIcon="pen"
                  type="email" value={email}
                  invalid={newsState === 'error'}
                  onChange={(e: any) => { setEmail(e.target.value); if (newsState === 'error') setNewsState('idle'); }}
                  onKeyDown={(e: any) => { if (e.key === 'Enter') subscribe(); }}
                  onTrailingClick={subscribe} />
                {newsState === 'error' && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--rating-critical)' }}>Enter a valid email address.</span>}
              </>
            )}
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
        {/* Improvement suggestion box */}
        <div className="sd-footer-feedback" style={{ marginTop: 44, paddingTop: 30, borderTop: '1px solid var(--border-subtle)', maxWidth: 560 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Help us improve Suede</div>
          {fbState === 'done' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
              <Icon name="check" size={16} color="var(--rating-positive)" /> Thank you — your suggestion is in.
            </div>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Spotted something, or have an idea? Tell us — we read every note.</div>
              <textarea value={fb} rows={3} maxLength={1000}
                onChange={(e) => { setFb(e.target.value); if (fbState === 'error') setFbState('idle'); }}
                placeholder="Share an improvement or report an issue…"
                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'var(--surface-card)', padding: '12px 13px', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', outline: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                <button onClick={sendFeedback} disabled={fbState === 'busy'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '2px 0', cursor: fbState === 'busy' ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-primary)', borderBottom: '1px solid var(--ink-900)', opacity: fbState === 'busy' ? 0.6 : 1 }}>
                  {fbState === 'busy' ? 'Sending…' : 'Submit suggestion'} <Icon name="arrow-right" size={15} color="var(--ink-900)" />
                </button>
                {fbState === 'error' && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--rating-critical)' }}>{fb.trim() ? 'Couldn’t send that — please try again.' : 'Add a short message first.'}</span>}
              </div>
            </>
          )}
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
