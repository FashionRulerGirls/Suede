/* Suede — image URL helpers.

   Photos are stored in public Supabase Storage buckets and referenced by their
   `/storage/v1/object/public/…` URL, which serves the FULL-SIZE original every
   time — slow in feeds and directories, and especially heavy for images
   uploaded before upload-time downscaling existed.

   `sized()` rewrites those URLs to Supabase's on-the-fly image-transform
   endpoint (`/render/image/public/…?width=…&quality=…`), which returns a
   resized, CDN-cached copy. Non-Supabase URLs (bundled `/assets/*`, blob
   previews, external product images) are returned unchanged.

   Image transformations require them to be enabled on the Supabase project;
   where they're not, SmartImg falls back to the original URL, so this is safe
   on any plan. */

const OBJ = '/storage/v1/object/public/';

export function isSupabasePublic(url?: string | null): boolean {
  return !!url && url.includes(OBJ);
}

// Rewrite a Supabase public object URL to a width-constrained render URL.
// `width` is in device pixels; any existing query (e.g. the ?v= cache token on
// avatars) is preserved so changed images still bust caches.
export function sized(url: string | null | undefined, width: number, quality = 72): string {
  if (!url) return (url as any) ?? '';
  const i = url.indexOf(OBJ);
  if (i === -1) return url; // not a Supabase object URL — leave as-is
  const base = url.slice(0, i);
  let rest = url.slice(i + OBJ.length);
  let query = '';
  const q = rest.indexOf('?');
  if (q !== -1) {
    query = rest.slice(q + 1);
    rest = rest.slice(0, q);
  }
  const params = new URLSearchParams(query);
  params.set('width', String(Math.max(1, Math.round(width))));
  params.set('quality', String(quality));
  return `${base}/storage/v1/render/image/public/${rest}?${params.toString()}`;
}
