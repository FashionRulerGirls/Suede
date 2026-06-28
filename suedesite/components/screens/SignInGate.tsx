'use client';
import React from 'react';
import { Button, Logo, Icon } from '@/components/ds';

export function SignInGate({ onRoute, title, message }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '90px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <Logo variant="monogram" height={64} />
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Members Only</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 38, color: 'var(--text-heading)', margin: 0 }}>{title}</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', margin: '14px auto 30px', maxWidth: 380 }}>{message}</p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={() => onRoute('signin')}>Sign In</Button>
        <Button variant="secondary" onClick={() => onRoute('createaccount')}>Create Account</Button>
      </div>
    </div>
  );
}
