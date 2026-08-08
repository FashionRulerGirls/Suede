'use client';
import { useEffect } from 'react';

// Registers the service worker so Suede is installable (and has an offline
// fallback). Critically, it also keeps an installed/warm PWA from getting stuck
// on stale app code: when a new service worker takes control, the page reloads
// once into the latest bundle. No-op where service workers aren't supported.
export function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    // If a controller already exists at load, any later controllerchange is an
    // UPDATE (not the first install) — reload once to run the fresh app code.
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;
    const onControllerChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    let reg: ServiceWorkerRegistration | undefined;
    const onVisible = () => { if (document.visibilityState === 'visible') reg?.update().catch(() => {}); };

    const register = async () => {
      try {
        reg = await navigator.serviceWorker.register('/sw.js');
        reg.update().catch(() => {});                 // check for a new worker now
        document.addEventListener('visibilitychange', onVisible); // …and whenever refocused
      } catch { /* ignore */ }
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return null;
}
