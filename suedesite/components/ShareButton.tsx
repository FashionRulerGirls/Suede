'use client';
import React from 'react';

const SITE = 'https://suedecapsule.com';
const enc = encodeURIComponent;

export type ShareCard = {
  kind?: 'review' | 'inquiry';
  brand?: string;
  product?: string;
  snippet?: string;
  rating?: number | null;
  by?: string;
  img?: string;
};

// Build the portrait "story" review-card image URL (served by /api/og?fmt=story).
export function storyCardUrl(origin: string, c: ShareCard): string {
  const qp = new URLSearchParams();
  qp.set('fmt', 'story');
  qp.set('kind', c.kind || 'review');
  if (c.brand) qp.set('brand', c.brand);
  if (c.product) qp.set('product', c.product);
  if (c.snippet) qp.set('snippet', c.snippet.slice(0, 120));
  if (c.rating != null) qp.set('rating', String(c.rating));
  if (c.by) qp.set('by', c.by);
  // Only pass an absolute http(s) image the OG renderer can fetch server-side.
  if (c.img && /^https?:\/\//.test(c.img)) qp.set('img', c.img);
  return `${origin}/api/og?${qp.toString()}`;
}

// Share glyph (three connected nodes) — no matching icon in the DS set.
const ShareGlyph = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
  </svg>
);

/* Share a review/inquiry. When `card` is provided we generate an actual review-
   card image and share it as a FILE through the native share sheet — so it can
   be posted to an Instagram Story or sent in a message as a card, not just a
   text link. Falls back to a URL share (link preview also shows the card) and,
   on desktop, a popover of platform links plus a "Save card" download. */
export function ShareButton({ path, title, text, label = 'Share', card }: { path: string; title: string; text?: string; label?: string; card?: ShareCard }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE;
  const url = origin + path;
  const shareText = text || title;
  const imageUrl = card ? storyCardUrl(origin, card) : '';

  // Fetch the generated card and wrap it in a File for navigator.share.
  const cardFile = async (): Promise<File | null> => {
    if (!imageUrl) return null;
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new File([blob], 'suede-review.png', { type: blob.type || 'image/png' });
    } catch { return null; }
  };

  const onClick = async () => {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    // 1) Share the review-card IMAGE (Instagram Story, Messages, etc.).
    if (card && nav?.share && nav?.canShare) {
      setBusy(true);
      const file = await cardFile();
      setBusy(false);
      if (file && nav.canShare({ files: [file] })) {
        try { await nav.share({ files: [file], title, text: shareText }); return; }
        catch { return; } // user cancelled
      }
    }
    // 2) Native URL share — the link preview renders the OG card.
    if (nav?.share) { try { await nav.share({ title, text: shareText, url }); return; } catch { return; } }
    // 3) Desktop fallback: popover.
    setOpen((o) => !o);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  };
  const saveCard = async () => {
    const file = await cardFile();
    if (!file) return;
    const href = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = href; a.download = 'suede-review.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 4000);
    setOpen(false);
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
      <button onClick={onClick} aria-label="Share" title="Share" disabled={busy}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: busy ? 'default' : 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', opacity: busy ? 0.6 : 1 }}>
        <ShareGlyph size={16} color="var(--text-primary)" />{busy ? 'Preparing…' : label}
      </button>
      {open && (
        <>
          <span onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 50, minWidth: 190, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xs)', padding: '6px', display: 'flex', flexDirection: 'column' }}>
            {card && (
              <button onClick={saveCard}
                style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 2 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--linen)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                Save review card
              </button>
            )}
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
