// Client-side normalisation for Capsule model cutouts. Every uploaded cutout is
// trimmed to its opaque content, then centred (horizontally) and bottom-aligned
// on a fixed 1:2 transparent canvas. This makes every brand's model render at a
// consistent size and baseline across the web grid and the mobile marquee,
// regardless of how the source PNG was exported. Returns a PNG Blob (alpha kept).

const TARGET_W = 600;   // 1:2 portrait — matches the Capsule cutout proportion
const TARGET_H = 1200;
const SIDE_PAD = 0.90;  // model fills ≤90% of width / ≤94% of height
const TOP_PAD = 0.94;
const BOTTOM = 0.99;    // baseline sits near the very bottom (models "stand")
const ALPHA_MIN = 12;   // treat pixels below this alpha as empty

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    img.src = url;
  });
}

// Bounding box of non-transparent pixels. Falls back to the full frame for a
// fully-opaque image (e.g. a JPEG with no alpha).
function contentBox(data: Uint8ClampedArray, w: number, h: number) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > ALPHA_MIN) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w, h };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export async function normalizeCutout(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const nw = img.naturalWidth, nh = img.naturalHeight;
  if (!nw || !nh) throw new Error('That image looks empty.');

  // Read the source pixels to find the model's true extent.
  const src = document.createElement('canvas');
  src.width = nw; src.height = nh;
  const sctx = src.getContext('2d');
  if (!sctx) throw new Error('Canvas is unavailable in this browser.');
  sctx.drawImage(img, 0, 0);
  let box;
  try {
    box = contentBox(sctx.getImageData(0, 0, nw, nh).data, nw, nh);
  } catch {
    box = { x: 0, y: 0, w: nw, h: nh }; // tainted/opaque source — use full frame
  }

  // Scale the trimmed model to fit the padded target box, preserving aspect.
  const maxW = TARGET_W * SIDE_PAD;
  const maxH = TARGET_H * TOP_PAD;
  const scale = Math.min(maxW / box.w, maxH / box.h);
  const dw = box.w * scale, dh = box.h * scale;
  const dx = (TARGET_W - dw) / 2;                 // centre horizontally
  const dy = TARGET_H * BOTTOM - dh;              // bottom-align

  const out = document.createElement('canvas');
  out.width = TARGET_W; out.height = TARGET_H;
  const octx = out.getContext('2d');
  if (!octx) throw new Error('Canvas is unavailable in this browser.');
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(img, box.x, box.y, box.w, box.h, dx, dy, dw, dh);

  return await new Promise<Blob>((resolve, reject) =>
    out.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process that image.'))), 'image/png'),
  );
}
