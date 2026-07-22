'use client';
import React from 'react';
import { track } from '@vercel/analytics';

// Root error boundary: catches render crashes anywhere in the app, reports them
// to Vercel Analytics as a custom event (so real-user crashes reach you), and
// shows a calm recovery screen instead of a white page.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    try {
      track('client_error', {
        message: String(error?.message || 'unknown').slice(0, 200),
        digest: error?.digest || '',
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      });
    } catch { /* never let reporting throw */ }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'ui-serif, Georgia, serif', background: '#F8F6F3', color: '#14120F' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 30, letterSpacing: '0.08em' }}>Something went wrong</div>
          <p style={{ maxWidth: 380, lineHeight: 1.6, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 15, color: '#6a5f55', margin: 0 }}>
            A hiccup on our end — it’s been logged. Try again, and if it keeps happening, head back home.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button onClick={() => reset()} style={{ padding: '11px 20px', background: '#14120F', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 14 }}>Try again</button>
            <a href="/" style={{ padding: '11px 20px', background: 'transparent', color: '#14120F', border: '1px solid #cabfb0', borderRadius: 4, textDecoration: 'none', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 14 }}>Back to Suede</a>
          </div>
        </div>
      </body>
    </html>
  );
}
