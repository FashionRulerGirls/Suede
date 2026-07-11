'use client';
import React from 'react';
import { Button, Input, Field, Checkbox, Card, Logo, Icon } from '@/components/ds';

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
  const [show, setShow] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  return (
    <AuthShell subtitle="Join the community">
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '40px 44px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 100, fontSize: 40, margin: 0 }}>Create Account</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 30 }}>
          <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="First Name" htmlFor="fn"><Input id="fn" variant="filled" maxLength={40} placeholder="First" /></Field>
            <Field label="Last Name" htmlFor="ln"><Input id="ln" variant="filled" maxLength={40} placeholder="Last" /></Field>
          </div>
          <Field label="Email Address" htmlFor="em"><Input id="em" variant="filled" maxLength={120} placeholder="your@email.com" /></Field>
          <Field label="Password" htmlFor="pw">
            <Input id="pw" variant="filled" maxLength={72} type={show ? 'text' : 'password'} placeholder="At least 12 characters"
              trailingIcon={show ? 'eye-off' : 'eye'} onTrailingClick={() => setShow(s => !s)} />
          </Field>
          <Field label="Confirm Password" htmlFor="cpw">
            <Input id="cpw" variant="filled" maxLength={72} type={show2 ? 'text' : 'password'} placeholder="Re-enter password"
              trailingIcon={show2 ? 'eye-off' : 'eye'} onTrailingClick={() => setShow2(s => !s)} />
          </Field>
          <Checkbox id="agree" checked={agree} onChange={setAgree} label="I agree to the Terms of Service and Privacy Policy" />
          <Button variant="primary" fullWidth onClick={() => onRoute('__signin')}>Create Account</Button>
          <OrDivider />
          <Button variant="secondary" fullWidth icon="google" onClick={() => onRoute('__signin')}>Continue with Google</Button>
          <Button variant="secondary" fullWidth icon="apple" onClick={() => onRoute('__signin')}>Continue with Apple</Button>
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
  return (
    <AuthShell>
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '36px 44px 40px' }}>
        <button onClick={() => onRoute('signin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>
          <Icon name="arrow-left" size={15} color="var(--text-muted)" /> Back to Sign in
        </button>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, margin: 0 }}>Forgot Password?</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 10, marginBottom: 28 }}>
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field label="Email Address" htmlFor="fem"><Input id="fem" variant="filled" maxLength={120} placeholder="your@email.com" /></Field>
          <Button variant="primary" fullWidth onClick={() => onRoute('verify')}>Send OTP</Button>
        </div>
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
  const [show, setShow] = React.useState(false);
  const [show2, setShow2] = React.useState(false);
  return (
    <AuthShell>
      <Card className="sd-auth-card" elevation="raised" radius="sm" style={{ padding: '36px 44px 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 36, margin: 0 }}>Reset Password</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 28 }}>
          <Field label="New Password" htmlFor="np">
            <Input id="np" variant="filled" maxLength={72} type={show ? 'text' : 'password'} placeholder="Enter your password"
              trailingIcon={show ? 'eye-off' : 'eye'} onTrailingClick={() => setShow(s => !s)} />
          </Field>
          <Field label="Confirm New Password" htmlFor="cnp">
            <Input id="cnp" variant="filled" maxLength={72} type={show2 ? 'text' : 'password'} placeholder="Enter your password"
              trailingIcon={show2 ? 'eye-off' : 'eye'} onTrailingClick={() => setShow2(s => !s)} />
          </Field>
          <Button variant="primary" fullWidth onClick={() => onRoute('__signin')}>Confirm</Button>
        </div>
      </Card>
    </AuthShell>
  );
}
