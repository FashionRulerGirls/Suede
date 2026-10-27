'use client';
import React from 'react';
import { Logo } from './Logo';

/* Branded inline loading state — a gently pulsing Suede monogram. Use it while
   data is loading so a page shows it's working instead of flashing an empty or
   "nothing here" state before the real content arrives. */
export function LoadingMono({ minHeight = '46vh', size = 60 }: { minHeight?: number | string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight }}>
      <Logo variant="monogram" height={size} color="var(--ink-900)" className="sd-loadmono" title="Loading" />
      <style>{`@keyframes sdLoadPulse{0%,100%{opacity:.22;transform:scale(.97)}50%{opacity:.55;transform:scale(1)}} .sd-loadmono{animation:sdLoadPulse 1.3s var(--ease-out) infinite}`}</style>
    </div>
  );
}
