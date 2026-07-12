'use client';
import React from 'react';
/* Suede — avatar crop dialog. Drag to reposition, slide to zoom, then export a
   square 512px JPEG (shown inside the circular avatar mask). Self-contained
   canvas crop — no external libraries. */
import { Button, Icon } from '@/components/ds';

const V = 300; // crop viewport (px)
const O = 512; // exported size (px)

export function AvatarCropper({ file, onCancel, onCropped }: any) {
  const [imgUrl] = React.useState<string>(() => URL.createObjectURL(file));
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [nat, setNat] = React.useState<{ w: number; h: number } | null>(null);
  const [z, setZ] = React.useState(1);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<any>(null);

  React.useEffect(() => () => URL.revokeObjectURL(imgUrl), [imgUrl]);

  const baseScale = nat ? Math.max(V / nat.w, V / nat.h) : 1;
  const scale = baseScale * z;
  const dw = nat ? nat.w * scale : V;
  const dh = nat ? nat.h * scale : V;
  const clamp = (x: number, y: number) => ({ x: Math.min(0, Math.max(V - dw, x)), y: Math.min(0, Math.max(V - dh, y)) });

  const onImgLoad = (e: any) => {
    const im = e.currentTarget;
    const n = { w: im.naturalWidth, h: im.naturalHeight };
    setNat(n);
    const s = Math.max(V / n.w, V / n.h);
    setPos({ x: (V - n.w * s) / 2, y: (V - n.h * s) / 2 }); // center
  };

  const onZoom = (nz: number) => {
    if (!nat) { setZ(nz); return; }
    const oldScale = baseScale * z, newScale = baseScale * nz;
    const cx = (V / 2 - pos.x) / oldScale, cy = (V / 2 - pos.y) / oldScale;
    const ndw = nat.w * newScale, ndh = nat.h * newScale;
    const nx = Math.min(0, Math.max(V - ndw, V / 2 - cx * newScale));
    const ny = Math.min(0, Math.max(V - ndh, V / 2 - cy * newScale));
    setZ(nz); setPos({ x: nx, y: ny });
  };

  const start = (e: any) => { const p = e.touches ? e.touches[0] : e; drag.current = { sx: p.clientX, sy: p.clientY, px: pos.x, py: pos.y }; };
  const move = (e: any) => {
    if (!drag.current) return;
    const p = e.touches ? e.touches[0] : e;
    setPos(clamp(drag.current.px + (p.clientX - drag.current.sx), drag.current.py + (p.clientY - drag.current.sy)));
  };
  const end = () => { drag.current = null; };

  const apply = () => {
    const img = imgRef.current;
    if (!img || !nat) return;
    const canvas = document.createElement('canvas');
    canvas.width = O; canvas.height = O;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sSize = V / scale;
    ctx.drawImage(img, -pos.x / scale, -pos.y / scale, sSize, sSize, 0, 0, O, O);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const base = (file.name || 'avatar').replace(/\.[^.]+$/, '');
      onCropped(new File([blob], `${base}.jpg`, { type: 'image/jpeg' }), URL.createObjectURL(blob));
    }, 'image/jpeg', 0.9);
  };

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20,18,15,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', padding: '28px 30px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>Adjust your photo</h2>
          <button onClick={onCancel} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-primary)' }}><Icon name="close" size={20} /></button>
        </div>

        <div
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          style={{ position: 'relative', width: V, height: V, maxWidth: '100%', margin: '0 auto', overflow: 'hidden', background: 'var(--linen)', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}>
          <img ref={imgRef} src={imgUrl} alt="" onLoad={onImgLoad} draggable={false}
            style={{ position: 'absolute', left: pos.x, top: pos.y, width: dw, height: dh, maxWidth: 'none', pointerEvents: 'none' }} />
          {/* circular mask */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: '0 0 0 9999px rgba(20,18,15,0.5)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', pointerEvents: 'none' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 24px' }}>
          <Icon name="image" size={15} color="var(--text-muted)" />
          <input type="range" min={1} max={3} step={0.01} value={z} onChange={(e) => onZoom(parseFloat(e.target.value))} style={{ flex: 1, accentColor: 'var(--ink-900)' }} aria-label="Zoom" />
          <Icon name="image" size={20} color="var(--text-muted)" />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="primary" onClick={apply} style={{ flex: 1 }}>Apply</Button>
        </div>
      </div>
    </div>
  );
}
