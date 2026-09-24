import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from '../theme';

// Warm-paper canvas with a whisper vignette and a thin inset editorial frame —
// the quiet, gallery-like surface the brand uses everywhere.
export const Backdrop: React.FC<{ children?: React.ReactNode; frame?: boolean }> = ({
  children,
  frame = true,
}) => {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {/* soft warm lift from center */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 32%, ${C.paper3} 0%, ${C.paper} 46%, #f0ede8 100%)`,
        }}
      />
      {/* faint grain for texture */}
      <AbsoluteFill style={{ opacity: 0.04, mixBlendMode: 'multiply' }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      {frame && (
        <AbsoluteFill
          style={{
            margin: 40,
            border: `1px solid ${C.hair}`,
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};
