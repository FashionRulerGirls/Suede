'use client';
import React from 'react';
import { Button, Input, Field, Checkbox, Card, Logo, Icon } from '@/components/ds';
import { useAuth } from '@/lib/auth';

function ErrorLine({ children }: any) {
  if (!children) return null;
  return (
    <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--rating-critical)' }}>
      <Icon name="info" size={15} color="var(--rating-critical)" /> {children}
    </div>
  );
}

function AuthShell({ children, subtitle, maxWidth = 560 }: any) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '56px 24px 0px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Logo variant="monogram" height={112} />
      </div>
      {subtitle && (
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-muted)', marginBottom: 36 }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)' }}>
      <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.08em' }}>OR</span>
      <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}

/* ---------- Create Account ---------- */
export function CreateAccountScreen({ onRoute }: any) {
  const { signUp, signInWithOAuth } = useAuth();
  const [show, setShow] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [first, setFirst] = React.useState('');
  const [last, setLast] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) { setError('Enter your email and a password.'); return; }
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!agree) { setError('Please accept the Terms of Service and Privacy Policy.'); return; }
    setBusy(true);
    const { error, needsConfirm } = await signUp(email.trim(), password, { display_name: `${first} ${last}`.trim() || undefined });
    setBusy(false);
    if (error) { setError(error); return; }
    if (needsConfirm) setSent(true); else onRoute('__signedin');
  };
  const oauth = async (provider: 'google' | 'apple') => {
    setError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) setError(error);
  };

  if (sent) {
    return (
      <AuthShell subtitle="Almost there">
        <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '40px 44px', textAlign: 'center' }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={26} color="var(--white)" /></span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 32, margin: 0 }}>Check your email</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, margin: '12px 0 0' }}>
            We sent a confirmation link to <b style={{ color: 'var(--text-primary)' }}>{email}</b>. Click it to finish creating your account.
          </p>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle="Join the community">
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '40px 44px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 40, margin: 0 }}>Create Account</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 30 }}>
          <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First Name" htmlFor="fn"><Input id="fn" variant="filled" maxLength={40} placeholder="First" value={first} onChange={(e: any) => setFirst(e.target.value)} /></Field>
            <Field label="Last Name" htmlFor="ln"><Input id="ln" variant="filled" maxLength={40} placeholder="Last" value={last} onChange={(e: any) => setLast(e.target.value)} /></Field>
          </div>
          <Field label="Email Address" htmlFor="em"><Input id="em" variant="filled" maxLength={120} placeholder="your@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} /></Field>
          <Field label="Password" htmlFor="pw">
            <Input id="pw" variant="filled" maxLength={72} type={show ? 'text' : 'password'} placeholder="At least 12 characters" value={password} onChange={(e: any) => setPassword(e.target.value)}
              trailingIcon={show ? 'eye-off' : 'eye'} onTrailingClick={() => setShow(s => !s)} />
          </Field>
          <Field label="Confirm Password" htmlFor="cpw">
            <Input id="cpw" variant="filled" maxLength={72} type={show2 ? 'text' : 'password'} placeholder="Re-enter password" value={confirm} onChange={(e: any) => setConfirm(e.target.value)}
              trailingIcon={show2 ? 'eye-off' : 'eye'} onTrailingClick={() => setShow2(s => !s)} />
          </Field>
          <Checkbox id="agree" checked={agree} onChange={setAgree} label={(() => {
            const link = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3 } as any;
            const stop = (r: string) => (e: any) => { e.preventDefault(); e.stopPropagation(); onRoute(r); };
            return <span>I agree to the <button type="button" style={link} onClick={stop('terms')}>Terms of Service</button> and <button type="button" style={link} onClick={stop('privacy')}>Privacy Policy</button></span>;
          })()} />
          <ErrorLine>{error}</ErrorLine>
          <Button variant="primary" fullWidth disabled={busy} onClick={submit}>{busy ? 'Creating…' : 'Create Account'}</Button>
          <OrDivider />
          <Button variant="secondary" fullWidth icon="google" onClick={() => oauth('google')}>Continue with Google</Button>
        </div>
      </Card>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '30px 0 0' }}>
        Already have an account? <button onClick={() => onRoute('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)' }}>Sign in</button>
      </p>
    </AuthShell>
  );
}

/* ---------- Forgot Password ---------- */
export function ForgotPasswordScreen({ onRoute }: any) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim()) { setError('Enter your email address.'); return; }
    setBusy(true);
    const { error } = await resetPassword(email.trim());
    setBusy(false);
    if (error) { setError(error); return; }
    setSent(true);
  };

  return (
    <AuthShell>
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '36px 44px 40px' }}>
        <button onClick={() => onRoute('signin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>
          <Icon name="arrow-left" size={15} color="var(--text-muted)" /> Back to Sign in
        </button>
        {sent ? (
          <React.Fragment>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, margin: 0 }}>Check your email</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 12 }}>
              If an account exists for <b style={{ color: 'var(--text-primary)' }}>{email}</b>, we've sent a link to reset your password.
            </p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, margin: 0 }}>Forgot Password?</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 10, marginBottom: 28 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <Field label="Email Address" htmlFor="fem"><Input id="fem" variant="filled" maxLength={120} placeholder="your@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} onKeyDown={(e: any) => e.key === 'Enter' && submit()} /></Field>
              <ErrorLine>{error}</ErrorLine>
              <Button variant="primary" fullWidth disabled={busy} onClick={submit}>{busy ? 'Sending…' : 'Send reset link'}</Button>
            </div>
          </React.Fragment>
        )}
      </Card>
    </AuthShell>
  );
}

/* ---------- Verification Code ---------- */
export function VerificationCodeScreen({ onRoute }: any) {
  const [code, setCode] = React.useState(['6', '', '', '']);
  const [resent, setResent] = React.useState(false);
  const refs = React.useRef<any[]>([]);
  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    setCode(c => { const n = [...c]; n[i] = d; return n; });
    if (d && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  return (
    <AuthShell>
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '36px 44px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, margin: 0 }}>Verification Code</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 10, marginBottom: 28 }}>
          Always confirm the security code received on your registered email.
        </p>
        <div style={{ display: 'flex', gap: 14, marginBottom: 26 }}>
          {code.map((d, i) => (
            <input key={i} ref={el => { refs.current[i] = el; }} value={d} onChange={e => setDigit(i, e.target.value)}
              inputMode="numeric" maxLength={1}
              style={{ flex: 1, height: 64, textAlign: 'center', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'var(--linen)', fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--text-primary)', outline: 'none' }} />
          ))}
        </div>
        <Button variant="primary" fullWidth onClick={() => onRoute('reset')}>Verify</Button>
      </Card>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: '24px 0 0' }}>
        {resent ? (
          <span style={{ color: 'var(--text-primary)' }}>A new code has been sent to your email.</span>
        ) : (
          <React.Fragment>Didn't receive the code? <button onClick={() => setResent(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--text-primary)' }}>Send again</button></React.Fragment>
        )}
      </p>
    </AuthShell>
  );
}

/* ---------- Reset Password ---------- */
export function ResetPasswordScreen({ onRoute }: any) {
  const { updatePassword } = useAuth();
  const [show, setShow] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setError(null);
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) { setError(error); return; }
    onRoute('__signedin');
  };

  return (
    <AuthShell>
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '36px 44px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, margin: 0 }}>Reset Password</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 28 }}>
          <Field label="New Password" htmlFor="np">
            <Input id="np" variant="filled" maxLength={72} type={show ? 'text' : 'password'} placeholder="At least 12 characters" value={password} onChange={(e: any) => setPassword(e.target.value)}
              trailingIcon={show ? 'eye-off' : 'eye'} onTrailingClick={() => setShow(s => !s)} />
          </Field>
          <Field label="Confirm New Password" htmlFor="cnp">
            <Input id="cnp" variant="filled" maxLength={72} type={show2 ? 'text' : 'password'} placeholder="Re-enter password" value={confirm} onChange={(e: any) => setConfirm(e.target.value)}
              trailingIcon={show2 ? 'eye-off' : 'eye'} onTrailingClick={() => setShow2(s => !s)} />
          </Field>
          <ErrorLine>{error}</ErrorLine>
          <Button variant="primary" fullWidth disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Confirm'}</Button>
        </div>
      </Card>
    </AuthShell>
  );
}
