'use client';
import React from 'react';
import { Button, Input, Field, Checkbox, Card, Logo } from '@/components/ds';

export function AuthScreen({ onRoute }: any) {
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Logo variant="monogram" height={112} />
      </div>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-muted)', marginBottom: 36 }}>
        Welcome back
      </p>
      <Card className="sd-auth-card" elevation="raised" radius="sm" padding="lg" style={{ padding: '40px 44px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 40, margin: 0 }}>Sign In</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 30 }}>
          <Field label="Email Address" htmlFor="email">
            <Input id="email" variant="filled" maxLength={120} placeholder="your@email.com" />
          </Field>
          <Field label="Password" htmlFor="pw">
            <Input id="pw" variant="filled" maxLength={72} type={show ? 'text' : 'password'} placeholder="Enter your password"
              trailingIcon={show ? 'eye-off' : 'eye'} onTrailingClick={() => setShow(s => !s)} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Checkbox id="rm" checked={remember} onChange={setRemember} label="Remember me" />
            <button onClick={() => onRoute('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>Forgot password?</button>
          </div>
          <Button variant="primary" fullWidth onClick={() => onRoute('__signin')}>Sign In</Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em' }}>OR</span>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
          <Button variant="secondary" fullWidth icon="google" onClick={() => onRoute('__signin')}>Continue with Google</Button>
          <Button variant="secondary" fullWidth icon="apple" onClick={() => onRoute('__signin')}>Continue with Apple</Button>
        </div>
      </Card>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '30px 0' }}>
        New to Suede? <button onClick={() => onRoute('createaccount')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)' }}>Create an account</button>
      </p>
    </div>
  );
}
