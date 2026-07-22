'use client';
import React from 'react';

const SITE = 'https://suedecapsule.com';
const enc = encodeURIComponent;

// Share glyph (three connected nodes) — no matching icon in the DS set.
const ShareGlyph = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
  </svg>
);

/* Share a review/inquiry to social media. Uses the native share sheet where the
   browser supports it (mobile), otherwise a small popover of platform links. */
export function ShareButton({ path, title, text, label = 'Share' }: { path: string; title: string; text?: string; label?: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE;
  const url = origin + path;
  const shareText = text || title;

  const onClick = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try { await (navigator as any).share({ title, text: shareText, url }); return; } catch { /* cancelled → fall through */ return; }
    }
    setOpen((o) => !o);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  };

  const links = [
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc(shareText + ' ' + url)}` },
    { label: 'Pinterest', href: `https://www.pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(shareText)}` },
    { label: 'Email', href: `mailto:?subject=${enc(title)}&body=${enc(shareText + '\n\n' + url)}` },
  ];

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={onClick} aria-label="Share" title="Share"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>
        <ShareGlyph size={16} color="var(--text-primary)" />{label}
      </button>
      {open && (
        <>
          <span onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 50, minWidth: 190, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xs)', padding: '6px', display: 'flex', flexDirection: 'column' }}>
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-xs)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--linen)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                {l.label}
              </a>
            ))}
            <button onClick={copy}
              style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', marginTop: 2 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--linen)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              {copied ? 'Link copied ✓' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </span>
  );
}
