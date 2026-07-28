// Client-side normalisation for Capsule model cutouts. Every uploaded cutout is
// trimmed to its opaque content, then centred (horizontally) and bottom-aligned
// on a fixed 1:2 transparent canvas. This makes every brand's model render at a
// consistent size and baseline across the web grid and the mobile marquee,
// regardless of how the source PNG was exported. Returns a PNG Blob (alpha kept).

const TARGET_W = 720;   // generous width so wide poses never need shrinking
const TARGET_H = 1200;
const MODEL_H = 0.94;   // EVERY model fills this fraction of the canvas HEIGHT —
                        // this is what makes the on-card height identical across
                        // brands (the card renders each cutout at height:100%).
const MAX_W = 0.98;     // …only shrink below MODEL_H if an unusually wide pose
                        // would otherwise spill past the frame edges.
const BOTTOM = 0.99;    // baseline sits near the very bottom (models "stand")
const ALPHA_MIN = 12;   // treat pixels below this alpha as empty

function loadImage(file: Blob): Promise<HTMLImageElement> {
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

// True when the image has a solid (opaque) background rather than a cut-out —
// every corner/edge is opaque and almost nothing is transparent. Such an image
// can't be trimmed, so it would render at the wrong size next to real cutouts.
function looksOpaque(data: Uint8ClampedArray, w: number, h: number): boolean {
  const A = (x: number, y: number) => data[(y * w + x) * 4 + 3];
  const edge = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1],
  ];
  if (!edge.every(([x, y]) => A(x, y) > 200)) return false; // a clear edge → it's a cutout
  let transparent = 0, total = 0;
  const step = Math.max(1, Math.floor(Math.min(w, h) / 64));
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
    total++; if (A(x, y) <= ALPHA_MIN) transparent++;
  }
  return transparent / total < 0.02; // essentially no transparency anywhere
}

export async function normalizeCutout(file: Blob): Promise<Blob> {
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
    const px = sctx.getImageData(0, 0, nw, nh).data;
    if (looksOpaque(px, nw, nh)) {
      throw new Error('This image has a solid background — please upload a transparent cut-out PNG so the model lines up with the other brands.');
    }
    box = contentBox(px, nw, nh);
  } catch (e: any) {
    if (e?.message?.startsWith('This image has a solid background')) throw e;
    box = { x: 0, y: 0, w: nw, h: nh }; // couldn't read pixels — use full frame
  }

  // Height-fill FIRST — this pins every model to the same rendered height on
  // the card. Only if an exceptionally wide pose would spill past the frame do
  // we shrink further (rare; keeps arms/hips from being clipped).
  let scale = (TARGET_H * MODEL_H) / box.h;
  if (box.w * scale > TARGET_W * MAX_W) scale = (TARGET_W * MAX_W) / box.w;
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
