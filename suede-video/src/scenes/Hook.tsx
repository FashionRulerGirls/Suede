import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F } from '../theme';
import { reveal, fadeUp, sceneFade } from '../components/anim';

// Three-beat kinetic statement about whose body the review is actually for.
const LINES: Array<{ t: string; italic?: boolean; muted?: boolean }> = [
  { t: 'Not the model’s body.', muted: true },
  { t: 'Not a stranger’s review.', muted: true },
  { t: 'Yours.', italic: true },
];

export const HookScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, dur), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start', padding: '0 120px' }}>
        {LINES.map((l, i) => {
          const p = reveal(frame, 8 + i * 22, 18);
          return (
            <div
              key={l.t}
              style={{
                ...fadeUp(p, 34),
                fontFamily: F.serif,
                fontStyle: l.italic ? 'italic' : 'normal',
                fontWeight: l.italic ? 500 : 400,
                fontSize: l.italic ? 150 : 84,
                lineHeight: 1.02,
                color: l.muted ? C.slate : C.ink,
                letterSpacing: '-0.005em',
              }}
            >
              {l.t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
