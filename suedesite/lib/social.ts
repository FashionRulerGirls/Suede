// Helpers for embedding member-linked social videos (TikTok / Instagram).
export type SocialPlatform = 'tiktok' | 'instagram';

export function detectPlatform(url?: string | null): SocialPlatform | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  return null;
}

// Standard TikTok post URLs carry the numeric id at /video/<id>. Short links
// (vm.tiktok.com) don't, so the caller falls back to a plain link-out.
export function tiktokVideoId(url: string): string | null {
  const m = url.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

// Load a third-party script once (idempotent), resolving when ready.
const loaded: Record<string, Promise<void>> = {};
export function loadScript(src: string): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (loaded[src]) return loaded[src];
  loaded[src] = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('script load failed: ' + src));
    document.body.appendChild(s);
  });
  return loaded[src];
}
