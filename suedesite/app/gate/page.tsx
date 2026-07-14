'use client';
import React from 'react';
import { Logo } from '@/components/ds';

/* Pre-launch gate. A single shared password unlocks the site for 30 days.
   Enforced by middleware.ts; this is just the entry form. */
export default function GatePage() {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get('next') || '';
        // Only same-origin paths: a single leading "/" not followed by "/" or
        // "\", so protocol-relative targets like "//evil.com" or "/\evil.com"
        // (which browsers treat as absolute) can't be used for an open redirect.
        window.location.href = /^\/(?![/\\])/.test(next) ? next : '/';
        return;
      }
      setError(true);
      setBusy(false);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--paper)',
      }}
    >
      <div
        style={{
          width: 420,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          textAlign: 'center',
        }}
      >
        <Logo variant="monogram" height={64} color="var(--ink-900)" />
        <Logo variant="wordmark" height={40} color="var(--ink-900)" style={{ marginTop: 6 }} />

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            margin: '20px 0 0',
          }}
        >
          Opening soon
        </p>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            lineHeight: 1.4,
            color: 'var(--text-heading)',
            margin: '8px 0 0',
          }}
        >
          We&rsquo;re putting the finishing touches on something special.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '6px 0 0',
          }}
        >
          Have an access password? Enter it below.
        </p>

        <form onSubmit={submit} style={{ width: '100%', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(false); }}
            placeholder="Access password"
            aria-label="Access password"
            style={{
              height: 52,
              width: '100%',
              boxSizing: 'border-box',
              padding: '0 16px',
              textAlign: 'center',
              background: 'var(--surface-card)',
              border: `1px solid ${error ? 'var(--rating-critical)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-xs)',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
            }}
          />
          {error && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--rating-critical)' }}>
              That password isn&rsquo;t right. Try again.
            </span>
          )}
          <button
            type="submit"
            disabled={busy || !password}
            style={{
              height: 52,
              width: '100%',
              background: 'var(--ink-900)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: busy || !password ? 'default' : 'pointer',
              opacity: busy || !password ? 0.6 : 1,
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {busy ? 'Entering…' : 'Enter'}
          </button>
        </form>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', margin: '22px 0 0' }}>
          Curious? Reach us at{' '}
          <a href="mailto:info@suedecapsule.com" style={{ color: 'var(--text-secondary)' }}>info@suedecapsule.com</a>
        </p>
      </div>
    </main>
  );
}
