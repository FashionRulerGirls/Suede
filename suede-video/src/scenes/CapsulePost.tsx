import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { F } from '../theme';

// ── Instagram post: "THE CAPSULE — Early Access Open" ───────────────────────
// Textured cream canvas. Heavy vertical "THE CAPSULE" lettering on the left,
// a continuous vertically-scrolling column of model cutouts down the centre,
// and "Early Access Open" + five outline stars on the right.

const CREAM = '#f7f4ed';
const CREAM_HI = '#fbf9f4';
const CREAM_LO = '#efe9df';
const INK = '#141210';

// One model per slot; each slot is a fixed height so the scroll reads evenly.
const MODELS = [
  { src: 'capsule/model1.png', h: 620 }, // red dress (full body)
  { src: 'capsule/model2.png', h: 600 }, // brown bomber (full body)
  { src: 'capsule/model3.png', h: 460 }, // yellow top (half body)
];
const GAP = 120;
const SLOT = (m: { h: number }) => m.h + GAP;
const STRIP_H = MODELS.reduce((s, m) => s + SLOT(m), 0);

// An empty (outline) five-point star.
const Star: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2.6l2.74 5.56 6.14.9-4.44 4.33 1.05 6.11L12 16.9l-5.49 2.6 1.05-6.11L3.12 9.06l6.14-.9L12 2.6z"
      stroke={INK}
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </svg>
);

const Column: React.FC = () => {
  const frame = useCurrentFrame();
  // Continuous upward scroll: travel exactly one strip-height per full cycle so
  // the duplicated strip makes the loop seamless.
  const CYCLE = 420; // frames for one full strip to pass
  const y = -((frame % CYCLE) / CYCLE) * STRIP_H;
  const strip = (keyPrefix: string) => (
    <>
      {MODELS.map((m, i) => (
        <div
          key={`${keyPrefix}-${i}`}
          style={{
            height: SLOT(m),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile(m.src)}
            style={{
              height: m.h,
              width: 'auto',
              maxWidth: 440,
              objectFit: 'contain',
              filter: 'drop-shadow(0 24px 40px rgba(20,18,16,0.14))',
            }}
          />
        </div>
      ))}
    </>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        width: 480,
        transform: `translateX(-50%) translateY(${y}px)`,
      }}
    >
      {strip('a')}
      {strip('b')}
    </div>
  );
};

export const CapsulePost: React.FC = () => {
  // No open/close fade — the piece is a seamless scroll loop (Instagram replays
  // feed video), so the content stays fully present end-to-end.
  const fade = 1;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {/* soft cream lift */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(130% 100% at 50% 40%, ${CREAM_HI} 0%, ${CREAM} 52%, ${CREAM_LO} 100%)`,
        }}
      />
      {/* paper grain */}
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'multiply' }}>
        <svg width="100%" height="100%">
          <filter id="grain-post">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-post)" />
        </svg>
      </AbsoluteFill>

      {/* scrolling model column (masked to the canvas so cutouts fade at edges) */}
      <AbsoluteFill style={{ opacity: fade }}>
        <AbsoluteFill
          style={{
            WebkitMaskImage:
              'linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
            maskImage:
              'linear-gradient(180deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
          }}
        >
          <Column />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* LEFT — big vertical "THE CAPSULE" (rotated, centred in full height) */}
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 0,
          bottom: 0,
          width: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fade,
        }}
      >
        <div
          style={{
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap',
            fontFamily: F.meta,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 0.84,
            letterSpacing: '0.01em',
            color: INK,
            textTransform: 'uppercase',
          }}
        >
          The Capsule
        </div>
      </div>

      {/* RIGHT — Early Access Open + five empty stars */}
      <div
        style={{
          position: 'absolute',
          right: 86,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 26,
          opacity: fade,
        }}
      >
        <div
          style={{
            fontFamily: F.serif,
            fontWeight: 500,
            fontSize: 72,
            lineHeight: 1.02,
            color: INK,
            textAlign: 'right',
          }}
        >
          Early
          <br />
          Access
          <br />
          Open
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={44} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CAPSULE_POST_TOTAL = 420; // one seamless scroll cycle @ 30fps = 14s
