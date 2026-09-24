import React from 'react';
import { C, F } from '../theme';

// Measurement spec, e.g.  5'7"  ·  B 34"  ·  W 27"  ·  H 39"
export const MeasurementSpec: React.FC<{
  height: string;
  bust: string;
  waist: string;
  hips: string;
  size?: number;
  color?: string;
}> = ({ height, bust, waist, hips, size = 26, color = C.muted }) => {
  const parts = [height, `B ${bust}`, `W ${waist}`, `H ${hips}`];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: F.meta,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.04em',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {parts.map((t, i) => (
        <React.Fragment key={t}>
          {i > 0 && <span style={{ opacity: 0.5 }}>/</span>}
          <span>{t}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

// Suede Match pill: dot + label (+ optional score).
export const MatchPill: React.FC<{ score?: number; confidence?: 'high' | 'medium' | 'low' }> = ({
  score,
  confidence = 'high',
}) => {
  const dot = confidence === 'high' ? C.green : confidence === 'medium' ? C.denim : C.taupe;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: F.sans,
        fontWeight: 400,
        fontSize: 24,
        letterSpacing: '0.02em',
        color: C.slate,
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} />
      Suede Match{score != null ? ` · ${score}%` : ''}
    </div>
  );
};

// Filled ink stars.
export const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 30 }) => (
  <div style={{ display: 'inline-flex', gap: 6, color: C.ink }}>
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = Math.max(0, Math.min(1, value - i));
      return (
        <div key={i} style={{ position: 'relative', width: size, height: size }}>
          <Star size={size} color={C.hair} />
          <div style={{ position: 'absolute', inset: 0, width: `${fill * 100}%`, overflow: 'hidden' }}>
            <Star size={size} color={C.ink} />
          </div>
        </div>
      );
    })}
  </div>
);

const Star: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path
      fill={color}
      d="M12 2.5l2.8 6.2 6.7.6-5.1 4.5 1.6 6.6L12 17.4 5.9 20.9l1.6-6.6-5.1-4.5 6.7-.6z"
    />
  </svg>
);

// Circular avatar with initials (no real faces — brand-safe placeholder).
export const AvatarInitials: React.FC<{ initials: string; size?: number; bg?: string }> = ({
  initials,
  size = 84,
  bg = C.linen,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      border: `1px solid ${C.hair}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F.serif,
      fontStyle: 'italic',
      fontWeight: 500,
      fontSize: size * 0.42,
      color: C.ink800,
    }}
  >
    {initials}
  </div>
);
