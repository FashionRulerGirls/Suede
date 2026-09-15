'use client';
import { useEffect } from 'react';

// The build this page is running (baked at build time by next.config.mjs).
const RUNNING = process.env.NEXT_PUBLIC_BUILD || '';

// Keeps the app — especially an installed PWA that can serve a stale cached
// shell — from getting stuck on old code:
//   1. Version check: on open and on every refocus, compare the deployed build
//      (/api/version) with the one running; reload once if they differ. This is
//      what actually fixes "closed and reopened the PWA but it's still stale".
//   2. Service worker: installability + offline fallback, plus a reload when a
//      new worker takes control.
export function RegisterSW() {
  useEffect(() => {
    let refreshing = false;
    let reg: ServiceWorkerRegistration | undefined;

    const checkVersion = async () => {
      if (!RUNNING || refreshing) return;
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { build } = await res.json();
        if (!build || build === RUNNING) return;
        // A newer build is live. Reload once per build id so a reload that
        // somehow doesn't refresh can't loop.
        try {
          if (sessionStorage.getItem('suede_build_reloaded') === build) return;
          sessionStorage.setItem('suede_build_reloaded', build);
        } catch { /* private mode — proceed */ }
        refreshing = true;
        window.location.reload();
      } catch { /* offline / not reachable — ignore */ }
    };

    const swSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
    // If a controller already exists at load, any later controllerchange is an
    // UPDATE (not the first install) — reload once into the fresh app code.
    const hadController = swSupported && !!navigator.serviceWorker.controller;
    const onControllerChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    if (swSupported) navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      checkVersion();
      reg?.update().catch(() => {});
    };

    const start = async () => {
      checkVersion();
      if (swSupported) {
        try {
          reg = await navigator.serviceWorker.register('/sw.js');
          reg.update().catch(() => {});
        } catch { /* ignore */ }
      }
      document.addEventListener('visibilitychange', onVisible);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      if (swSupported) navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return null;
}
