/* Suede — Supabase Storage uploads. Files live under a {userId}/ folder so the
   owner-folder storage policies allow the write; buckets are public-read. */
import type { SupabaseClient } from '@supabase/supabase-js';
import { downscaleImage } from './imageResize';

function extOf(file: File): string {
  const m = file.name?.match(/\.([a-zA-Z0-9]+)$/);
  if (m) return m[1].toLowerCase();
  const t = file.type?.split('/')[1];
  return t || 'jpg';
}

// Upload (or replace) the member's avatar; returns a cache-busted public URL.
export async function uploadAvatar(sb: SupabaseClient, userId: string, file: File): Promise<string> {
  const small = await downscaleImage(file, 512, 0.85); // displayed at ≤244px
  const path = `${userId}/avatar.${extOf(small)}`;
  const { error } = await sb.storage.from('avatars').upload(path, small, {
    upsert: true,
    contentType: small.type || undefined,
    cacheControl: '31536000',
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
    // Downscale photos before upload (videos pass through untouched).
    const upFile = kind === 'image' ? await downscaleImage(file, 1600, 0.82) : file;
    const path = `${userId}/${reviewId}/${stamp}-${i}.${extOf(upFile)}`;
    const { error } = await sb.storage.from('review-media').upload(path, upFile, {
      upsert: true, contentType: upFile.type || undefined, cacheControl: '31536000',
    });
    if (error) { failed++; continue; }
    const { data } = sb.storage.from('review-media').getPublicUrl(path);
    urls.push(data.publicUrl);

    let poster_url: string | null = null;
    if (kind === 'video' && poster) {
      const upPoster = await downscaleImage(poster, 1280, 0.82);
      const pPath = `${userId}/${reviewId}/${stamp}-${i}-poster.${extOf(upPoster)}`;
      const { error: pErr } = await sb.storage.from('review-media').upload(pPath, upPoster, {
        upsert: true, contentType: upPoster.type || undefined, cacheControl: '31536000',
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

// Upload a brand document (PDF, image, etc.) into the public brand-assets
// bucket, under the owner's uid folder so the owner-write policy allows it.
// Returns the public URL.
export async function uploadBrandDocument(sb: SupabaseClient, userId: string, brandId: string, file: File): Promise<string> {
  const safe = (file.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-60);
  const path = `${userId}/${brandId}/${Date.now()}-${safe}`;
  const { error } = await sb.storage.from('brand-assets').upload(path, file, {
    upsert: true, contentType: file.type || undefined, cacheControl: '31536000',
  });
  if (error) throw error;
  return sb.storage.from('brand-assets').getPublicUrl(path).data.publicUrl;
}
