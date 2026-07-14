/* Suede — Supabase Storage uploads. Files live under a {userId}/ folder so the
   owner-folder storage policies allow the write; buckets are public-read. */
import type { SupabaseClient } from '@supabase/supabase-js';

function extOf(file: File): string {
  const m = file.name?.match(/\.([a-zA-Z0-9]+)$/);
  if (m) return m[1].toLowerCase();
  const t = file.type?.split('/')[1];
  return t || 'jpg';
}

// Upload (or replace) the member's avatar; returns a cache-busted public URL.
export async function uploadAvatar(sb: SupabaseClient, userId: string, file: File): Promise<string> {
  const path = `${userId}/avatar.${extOf(file)}`;
  const { error } = await sb.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data } = sb.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export type ReviewMediaItem = { file: File; poster?: File | null };

// Upload review fit photos/videos (each video may carry a chosen poster image),
// then record them in the media table. Best-effort per item.
export async function uploadReviewMedia(
  sb: SupabaseClient,
  userId: string,
  reviewId: string,
  items: ReviewMediaItem[],
  startPosition = 0,
): Promise<string[]> {
  const urls: string[] = [];
  let failed = 0; // surfaced to the caller so silent upload failures are visible
  const stamp = Date.now(); // unique token so edits never overwrite existing files
  for (let i = 0; i < items.length; i++) {
    const { file, poster } = items[i];
    const kind = (file.type || '').startsWith('video') ? 'video' : 'image';
    const path = `${userId}/${reviewId}/${stamp}-${i}.${extOf(file)}`;
    const { error } = await sb.storage.from('review-media').upload(path, file, {
      upsert: true, contentType: file.type || undefined, cacheControl: '3600',
    });
    if (error) { failed++; continue; }
    const { data } = sb.storage.from('review-media').getPublicUrl(path);
    urls.push(data.publicUrl);

    let poster_url: string | null = null;
    if (kind === 'video' && poster) {
      const pPath = `${userId}/${reviewId}/${stamp}-${i}-poster.${extOf(poster)}`;
      const { error: pErr } = await sb.storage.from('review-media').upload(pPath, poster, {
        upsert: true, contentType: poster.type || undefined, cacheControl: '3600',
      });
      if (!pErr) poster_url = sb.storage.from('review-media').getPublicUrl(pPath).data.publicUrl;
    }

    const { error: insErr } = await sb.from('media').insert({
      parent_type: 'review',
      parent_id: reviewId,
      url: data.publicUrl,
      kind,
      position: startPosition + i,
      poster_url,
    });
    if (insErr) failed++;
  }
  // Let the caller know if any file didn't make it (storage bucket missing,
  // policy not applied, RLS, etc.) instead of failing silently.
  if (failed) throw new Error(`${failed} of ${items.length} file(s) failed to upload`);
  return urls;
}
