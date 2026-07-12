'use client';
import React from 'react';
import { Icon } from './Icon';

/* Full-screen media preview. Shows an image (fit to screen, uncropped) or a
   video with controls. Backdrop / X / Esc closes; arrows navigate a set. */
export function Lightbox({ items = [], index = 0, onClose, onIndex }: any) {
  const count = items.length;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      else if (count > 1 && e.key === 'ArrowRight') onIndex?.((index + 1) % count);
      else if (count > 1 && e.key === 'ArrowLeft') onIndex?.((index - 1 + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, onClose, onIndex]);
  if (!count) return null;
  const cur = items[Math.max(0, Math.min(index, count - 1))];
  const multi = count > 1;
  const go = (dir: number) => (e: any) => { e.stopPropagation(); onIndex?.((index + dir + count) % count); };
  const arrow = (side: string): any => ({ position: 'absolute', [side]: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(10,9,8,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <button onClick={(e) => { e.stopPropagation(); onClose?.(); }} aria-label="Close preview" style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', zIndex: 2 }}>
        <Icon name="close" size={28} color="#fff" />
      </button>
      {multi && <button onClick={go(-1)} aria-label="Previous" style={arrow('left')}><Icon name="arrow-left" size={24} color="#fff" /></button>}
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cur.kind === 'video'
          ? <video src={cur.url} controls autoPlay playsInline style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 2 }} />
          : <img src={cur.url} alt="" style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 2 }} />}
      </div>
      {multi && <button onClick={go(1)} aria-label="Next" style={arrow('right')}><Icon name="arrow-right" size={24} color="#fff" /></button>}
      {multi && <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', fontSize: 13 }}>{index + 1} / {count}</div>}
    </div>
  );
}
