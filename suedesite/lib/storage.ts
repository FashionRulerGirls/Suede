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

// Upload review fit photos/videos, then record them in the media table.
// Returns the public URLs in order. Best-effort per file.
export async function uploadReviewMedia(
  sb: SupabaseClient,
  userId: string,
  reviewId: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const kind = (file.type || '').startsWith('video') ? 'video' : 'image';
    const path = `${userId}/${reviewId}/${i}.${extOf(file)}`;
    const { error } = await sb.storage.from('review-media').upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
      cacheControl: '3600',
    });
    if (error) continue;
    const { data } = sb.storage.from('review-media').getPublicUrl(path);
    urls.push(data.publicUrl);
    await sb.from('media').insert({
      parent_type: 'review',
      parent_id: reviewId,
      url: data.publicUrl,
      kind,
      position: i,
    });
  }
  return urls;
}
