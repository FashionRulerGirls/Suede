import React from 'react';
import { C, F } from '../theme';

// Ring-S monogram. `p` (0→1) draws the ring and settles the letter.
export const Monogram: React.FC<{ size?: number; p?: number; color?: string }> = ({
  size = 128,
  p = 1,
  color = C.ink,
}) => {
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.serif,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: size * 0.5,
          color,
          opacity: Math.max(0, (p - 0.4) / 0.6),
          paddingBottom: size * 0.02,
        }}
      >
        S
      </div>
    </div>
  );
};

// "Suede" wordmark — Cormorant italic, generously tracked.
export const Wordmark: React.FC<{ size?: number; color?: string }> = ({ size = 150, color = C.ink800 }) => (
  <div
    style={{
      fontFamily: F.serif,
      fontStyle: 'italic',
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: '0.01em',
      color,
    }}
  >
    Suede
  </div>
);

// Uppercase tracked eyebrow (Darker Grotesque).
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.muted,
}) => (
  <div
    style={{
      fontFamily: F.meta,
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: '0.34em',
      textTransform: 'uppercase',
      color,
    }}
  >
    {children}
  </div>
);
