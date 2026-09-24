import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F } from '../theme';
import { Eyebrow } from '../components/Marks';
import { reveal, fadeUp, sceneFade } from '../components/anim';

const ROW_A = ['BABES', 'YAGI WORLD', 'BBX', 'MAISON EMER', 'ATELIER RÊVE'];
const ROW_B = ['STUDIO NOIR', 'LIOR', 'CÉLESTE', 'VERDA', 'HÔTEL DE VILLE'];

const SLOT = 640; // fixed px per wordmark → seamless modulo wrap

const Marquee: React.FC<{ items: string[]; frame: number; speed: number; dir: 1 | -1 }> = ({
  items,
  frame,
  speed,
  dir,
}) => {
  const setW = items.length * SLOT;
  const base = ((frame * speed) % setW + setW) % setW;
  const x = dir === -1 ? -base : base - setW;
  const loop = [...items, ...items, ...items];
  return (
    <div style={{ width: '100%', overflow: 'hidden', height: 110 }}>
      <div style={{ display: 'flex', transform: `translateX(${x}px)`, willChange: 'transform' }}>
        {loop.map((b, i) => (
          <span
            key={b + i}
            style={{
              width: SLOT,
              flex: 'none',
              textAlign: 'center',
              fontFamily: F.serif,
              fontWeight: 500,
              fontSize: 58,
              letterSpacing: '0.14em',
              color: C.ink800,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
};

export const CapsuleScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, dur), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 54, width: '100%' }}>
        <div style={{ ...fadeUp(reveal(frame, 4, 16)), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Eyebrow>The Capsule</Eyebrow>
          <div
            style={{
              fontFamily: F.serif,
              fontWeight: 400,
              fontSize: 76,
              lineHeight: 1.06,
              textAlign: 'center',
              color: C.ink,
              maxWidth: 840,
            }}
          >
            A vetted edit of
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 500 }}>independent brands.</span>
          </div>
        </div>
        <div style={{ ...fadeUp(reveal(frame, 26, 20)), display: 'flex', flexDirection: 'column', gap: 30, width: '100%' }}>
          <Marquee items={ROW_A} frame={frame} speed={3.4} dir={-1} />
          <Marquee items={ROW_B} frame={frame} speed={2.6} dir={1} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
