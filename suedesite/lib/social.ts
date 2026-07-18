// Helpers for embedding member-linked social videos (TikTok / Instagram).
// We embed via each platform's direct iframe player rather than their
// blockquote + embed.js SDK: no third-party script, faster, more private, and
// it avoids the SDK's "video currently unavailable" re-processing failures.
export type SocialPlatform = 'tiktok' | 'instagram';

export function detectPlatform(url?: string | null): SocialPlatform | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  return null;
}

// Standard TikTok post URLs carry the numeric id at /video/<id>. Short links
// (vm.tiktok.com/…) don't, so there's no embeddable id → caller links out.
function tiktokEmbedSrc(url: string): string | null {
  const id = url.match(/\/video\/(\d+)/)?.[1];
  return id ? `https://www.tiktok.com/player/v1/${id}?music_info=1&description=1` : null;
}

// Instagram posts/reels embed as an iframe by appending /embed to the permalink.
function instagramEmbedSrc(url: string): string | null {
  const m = url.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const type = m[1] === 'reels' ? 'reel' : m[1];
  return `https://www.instagram.com/${type}/${m[2]}/embed`;
}

// The iframe src for a supported URL, or null if we can't build one (→ link out).
export function embedInfo(url: string): { platform: SocialPlatform; src: string } | null {
  const platform = detectPlatform(url);
  if (platform === 'tiktok') { const src = tiktokEmbedSrc(url); return src ? { platform, src } : null; }
  if (platform === 'instagram') { const src = instagramEmbedSrc(url); return src ? { platform, src } : null; }
  return null;
}
