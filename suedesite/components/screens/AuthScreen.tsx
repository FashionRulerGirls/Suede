'use client';
import React from 'react';
import { Button, Input, Field, Checkbox, Card, Logo, Icon } from '@/components/ds';
import { useAuth } from '@/lib/auth';

export function AuthScreen({ onRoute }: any) {
  const { signIn, signInWithOAuth } = useAuth();
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const doSignIn = async () => {
    setError(null);
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) { setError(error); return; }
    onRoute('__signedin');
  };
  const oauth = async (provider: 'google' | 'apple') => {
    setError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) setError(error);
  };
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
            <Input id="email" variant="filled" maxLength={120} placeholder="your@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} onKeyDown={(e: any) => e.key === 'Enter' && doSignIn()} />
          </Field>
          <Field label="Password" htmlFor="pw">
            <Input id="pw" variant="filled" maxLength={72} type={show ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e: any) => setPassword(e.target.value)} onKeyDown={(e: any) => e.key === 'Enter' && doSignIn()}
              trailingIcon={show ? 'eye-off' : 'eye'} onTrailingClick={() => setShow(s => !s)} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Checkbox id="rm" checked={remember} onChange={setRemember} label="Remember me" />
            <button onClick={() => onRoute('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>Forgot password?</button>
          </div>
          {error && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--rating-critical)' }}>
              <Icon name="info" size={15} color="var(--rating-critical)" /> {error}
            </div>
          )}
          <Button variant="primary" fullWidth disabled={busy} onClick={doSignIn}>{busy ? 'Signing in…' : 'Sign In'}</Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em' }}>OR</span>
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
          <Button variant="secondary" fullWidth icon="google" onClick={() => oauth('google')}>Continue with Google</Button>
        </div>
      </Card>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '30px 0' }}>
        New to Suede? <button onClick={() => onRoute('createaccount')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)' }}>Create an account</button>
      </p>
    </div>
  );
}
