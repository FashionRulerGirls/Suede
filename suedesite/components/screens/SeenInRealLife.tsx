'use client';
import React from 'react';
import { Icon, SocialVideo, Lightbox } from '@/components/ds';
import type { BrandVideo } from '@/lib/contentData';

/* Brand-page "Seen in real life" strip — a horizontal row of the brand's
   review videos (uploaded clips + linked TikTok/Instagram), shown above the
   reviews the way Amazon floats review videos to the top. Facades only; the
   real player (native <video> or the social embed) opens on tap. */
export function SeenInRealLife({ items = [] }: { items?: BrandVideo[] }) {
  const [lb, setLb] = React.useState<{ url: string; poster: string | null } | null>(null);
  if (!items.length) return null;
  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '8px 40px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>Seen in real life</h2>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Real videos from reviews</span>
      </div>
      <div className="sd-sirl-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x proximity' }}>
        {items.map((it, i) => (
          <div key={i} style={{ flex: 'none', width: 156, scrollSnapAlign: 'start' }}>
            {it.type === 'social'
              ? <SocialVideo url={it.url} label="" />
              : <UploadFacade url={it.url} poster={it.poster} onOpen={() => setLb({ url: it.url, poster: it.poster })} />}
          </div>
        ))}
      </div>
      {lb && <Lightbox items={[{ url: lb.url, kind: 'video', poster: lb.poster || undefined }]} index={0} onClose={() => setLb(null)} />}
    </div>
  );
}

function UploadFacade({ url, poster, onOpen }: { url: string; poster: string | null; onOpen: () => void }) {
  return (
    <button onClick={onOpen} style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '9/16', border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', background: 'var(--ink-900)' }}>
      {poster
        ? <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} />
        : <video src={url} muted playsInline preload="metadata" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />}
      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,18,15,0.05), rgba(20,18,15,0.45))' }} />
      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="play" size={20} color="var(--ink-900)" />
      </span>
    </button>
  );
}
