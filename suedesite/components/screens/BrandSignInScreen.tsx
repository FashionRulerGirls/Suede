'use client';
import React from 'react';
import { Button, Input, Field, Icon, Logo } from '@/components/ds';

export function BrandSignInScreen({ onRoute }: any) {
  return (
    <div style={{ maxWidth: 583, margin: '0 auto', padding: '64px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Logo variant="monogram" height={112} />
      </div>

      {/* Sign in card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: 48, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>Sign in</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#111114', margin: 0 }}>Welcome back</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-500)', margin: 0 }}>Sign in to manage your brand presence.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="Email"><Input variant="outline" size="lg" placeholder="you@brand.com" /></Field>
          <Field label="Password"><Input variant="outline" size="lg" type="password" placeholder="••••••••" /></Field>
          <button onClick={() => onRoute('forgot')} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-500)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Forgot Password?</button>
          <Button variant="primary" fullWidth onClick={() => { window.location.href = '../brand-portal/index.html'; }}>Sign in</Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--ink-400)' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>OR</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="secondary" fullWidth icon="google" onClick={() => { window.location.href = '../brand-portal/index.html'; }}>Continue with Google</Button>
          <Button variant="secondary" fullWidth icon="apple" onClick={() => { window.location.href = '../brand-portal/index.html'; }}>Continue with Apple</Button>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(26,26,26,0.5)' }}>
          New here? <button onClick={() => onRoute('apply')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Apply to The Capsule</button>
        </span>
      </div>
    </div>
  );
}
