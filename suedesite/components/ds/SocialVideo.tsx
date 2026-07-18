'use client';
import React from 'react';
import { Icon } from './Icon';
import { detectPlatform, tiktokVideoId, loadScript, SocialPlatform } from '@/lib/social';

/* A member-linked TikTok / Instagram video shown as a facade: a lightweight
   branded thumbnail card. The heavy official embed only loads when tapped,
   in a lightbox — fast, private, and consistent across the site (review page
   and the brand "Seen in real life" strip). Falls back to a link-out if the
   embed can't hydrate. */

function EmbedLightbox({ url, platform, onClose }: { url: string; platform: SocialPlatform; onClose: () => void }) {
  const holder = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = holder.current;
    if (!el) return;
    if (platform === 'tiktok') {
      const id = tiktokVideoId(url) || '';
      el.innerHTML = `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${id}" style="max-width:605px;min-width:325px;margin:0"><a href="${url}"></a></blockquote>`;
      // Re-adding embed.js triggers TikTok to (re)process embeds on the page.
      loadScript('https://www.tiktok.com/embed.js').catch(() => {});
    } else {
      el.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="width:100%;max-width:540px;margin:0"></blockquote>`;
      loadScript('https://www.instagram.com/embed.js')
        .then(() => { (window as any).instgrm?.Embeds?.process?.(); })
        .catch(() => {});
    }
  }, [url, platform]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const label = platform === 'tiktok' ? 'TikTok' : 'Instagram';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(20,18,15,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', background: 'var(--surface-card)', maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', padding: 20 }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 14, zIndex: 2, background: 'var(--surface-card)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
          <Icon name="close" size={20} color="var(--text-primary)" />
        </button>
        <div ref={holder} style={{ display: 'flex', justifyContent: 'center', minHeight: 200 }} />
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          <Icon name={platform} size={14} color="var(--text-secondary)" />Open on {label}
        </a>
      </div>
    </div>
  );
}

export function SocialVideo({ url, poster, label = 'Seen in real life', style }: { url: string; poster?: string; label?: string; style?: any }) {
  const platform = detectPlatform(url);
  const [open, setOpen] = React.useState(false);
  if (!platform) return null;
  const platformLabel = platform === 'tiktok' ? 'TikTok' : 'Instagram';
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '9/16', border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', background: poster ? 'var(--linen)' : 'var(--ink-900)', ...style }}>
        {poster && <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />}
        <span style={{ position: 'absolute', inset: 0, background: poster ? 'linear-gradient(180deg, rgba(20,18,15,0.15), rgba(20,18,15,0.65))' : 'transparent' }} />
        {/* platform chip */}
        <span style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(20,18,15,0.55)', color: 'var(--white)', borderRadius: 'var(--radius-xs)', padding: '4px 8px', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.04em' }}>
          <Icon name={platform} size={13} color="var(--white)" />{platformLabel}
        </span>
        {/* play button */}
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={22} color="var(--ink-900)" />
        </span>
        {label && (
          <span style={{ position: 'absolute', left: 12, right: 12, bottom: 12, fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)' }}>{label}</span>
        )}
      </button>
      {open && <EmbedLightbox url={url} platform={platform} onClose={() => setOpen(false)} />}
    </>
  );
}
