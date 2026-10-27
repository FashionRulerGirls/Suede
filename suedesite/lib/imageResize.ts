// Client-side image downscaling for uploads. Phone photos are often 3–8 MB and
// get painted into small boxes; this shrinks them to a sane max dimension and
// re-encodes as WebP before upload, cutting bytes ~10–40× with no visible loss.
// Browser-only (uses canvas). Falls back to the original file on any failure.

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

const rename = (name: string) => (name || 'image').replace(/\.[a-zA-Z0-9]+$/, '') + '.webp';

/**
 * Downscale an image File to fit within `maxDim` on its longest side (never
 * upscales) and re-encode as WebP. Returns a new File, or the original if it's
 * not an image or anything goes wrong.
 */
export async function downscaleImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (typeof document === 'undefined') return file;
  if (!file.type || !file.type.startsWith('image/')) return file;
  try {
    const img = await loadImage(file);
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return file;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const dw = Math.round(w * scale), dh = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = dw; canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, dw, dh);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
    if (!blob) return file;
    // If re-encoding didn't actually save bytes (rare for small files), keep it anyway
    // — WebP + the dimension cap keeps the display path consistent.
    return new File([blob], rename(file.name), { type: 'image/webp' });
  } catch {
    return file;
  }
}
