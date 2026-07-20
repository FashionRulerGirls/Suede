'use client';
import React from 'react';

/* "Add Suede to Home Screen" affordance.

   - Android / desktop Chrome & Edge fire `beforeinstallprompt`; we capture it
     and, on tap, call prompt() to show the real native install dialog.
   - iOS Safari has NO install API (Apple restriction) — the best possible is a
     small sheet telling the user to tap Share → Add to Home Screen.
   - When the app is already installed (running standalone), or when neither
     path applies, the hook reports canShow=false and the menu item renders
     nothing. */

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as any).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac; detect via touch.
  const iPadOS = /Macintosh/i.test(ua) && 'ontouchend' in document;
  return iOSDevice || iPadOS;
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = React.useState<BIPEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [ios, setIos] = React.useState(false);

  React.useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIOS());
    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Native install available (Android / desktop), OR iOS where we can show a hint.
  const canShow = !installed && (!!deferred || ios);

  const promptInstall = React.useCallback(async () => {
    if (!deferred) return 'unavailable';
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      return choice.outcome; // 'accepted' | 'dismissed'
    } catch {
      return 'error';
    }
  }, [deferred]);

  return { canShow, canNativeInstall: !!deferred, ios, installed, promptInstall };
}

/* A menu row styled to match the other hamburger items. Renders null when there
   is nothing to offer. On iOS it opens a lightweight instruction sheet. */
export function InstallMenuItem({ onBeforeAction }: { onBeforeAction?: () => void }) {
  const { canShow, canNativeInstall, ios, promptInstall } = useInstallPrompt();
  const [showIOSHelp, setShowIOSHelp] = React.useState(false);

  if (!canShow) return null;

  const handle = async () => {
    if (canNativeInstall) {
      onBeforeAction?.();
      await promptInstall();
    } else if (ios) {
      setShowIOSHelp(true);
    }
  };

  return (
    <>
      <button onClick={handle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span aria-hidden style={{ fontSize: 17, lineHeight: 1 }}>📲</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 16, color: 'var(--text-primary)' }}>Add Suede to Home Screen</span>
        </span>
      </button>

      {showIOSHelp && (
        <div onClick={() => setShowIOSHelp(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(20,18,15,0.62)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 460, background: 'var(--surface-card)', borderTopLeftRadius: 18, borderTopRightRadius: 18, boxShadow: 'var(--shadow-lg)', padding: '26px 24px calc(28px + env(safe-area-inset-bottom))' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-primary)', marginBottom: 6 }}>Install Suede</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 18px' }}>
              Add Suede to your Home Screen for a full-screen, app-like experience.
            </p>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--linen)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>1</span>
                Tap the <b>Share</b> icon
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--text-secondary)' }}><path d="M12 3v13M12 3l-4 4M12 3l4 4"/><path d="M6 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1"/></svg>
                in the Safari toolbar
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--linen)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>2</span>
                Choose <b>Add to Home Screen</b>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--linen)', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>3</span>
                Tap <b>Add</b> — done.
              </li>
            </ol>
            <button onClick={() => setShowIOSHelp(false)}
              style={{ marginTop: 24, height: 48, width: '100%', background: 'var(--ink-900)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, letterSpacing: 'var(--ls-wide)' }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
