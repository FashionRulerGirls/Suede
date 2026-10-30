'use client';
import React from 'react';
import { sized, isSupabasePublic } from '@/lib/img';

/* Drop-in <img> that serves display-sized photos and loads them lazily.

   - `w` is the CSS display width; the resized request asks for ~2× that (capped)
     so it stays crisp on retina while still being a fraction of the original.
   - Supabase image transforms are probed once per device; until we know they
     work we serve the original, and if a resized request ever fails we fall
     back to the original for that image. So this never shows a broken photo,
     on any Supabase plan.
   - Lazy + async decode by default; pass `eager` for above-the-fold images. */

type Mode = 'unknown' | 'on' | 'off';
let mode: Mode = 'unknown';
const listeners = new Set<(m: Mode) => void>();
try {
  const s = typeof localStorage !== 'undefined' ? localStorage.getItem('suede_img_tx') : null;
  if (s === 'on' || s === 'off') mode = s;
} catch {}

function setMode(m: Mode) {
  if (m === mode) return;
  mode = m;
  try { localStorage.setItem('suede_img_tx', m); } catch {}
  listeners.forEach((fn) => fn(m));
}

let probing = false;
function probe(sampleUrl: string) {
  if (probing || mode !== 'unknown' || typeof Image === 'undefined') return;
  probing = true;
  const img = new Image();
  img.onload = () => setMode('on');
  img.onerror = () => setMode('off');
  img.src = sized(sampleUrl, 24, 40);
}

const CAP = 1600; // never request wider than our largest stored image

export function SmartImg({ src, w, quality, alt = '', eager, onError, ...rest }: any) {
  const [m, setM] = React.useState<Mode>(mode);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const fn = (nm: Mode) => setM(nm);
    listeners.add(fn);
    setM(mode);
    if (mode === 'unknown' && isSupabasePublic(src)) probe(src);
    return () => { listeners.delete(fn); };
  }, [src]);

  const canTx = m === 'on' && !failed && !!w && isSupabasePublic(src);
  const finalSrc = canTx ? sized(src, Math.min(Math.round(w * 2), CAP), quality) : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={(e) => {
        if (canTx) { setFailed(true); setMode('off'); }
        onError && onError(e);
      }}
      {...rest}
    />
  );
}
