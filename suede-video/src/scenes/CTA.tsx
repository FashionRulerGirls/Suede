import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { C, F } from '../theme';
import { Monogram, Wordmark } from '../components/Marks';
import { reveal, fadeUp, sceneFade } from '../components/anim';

export const CTAScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const rule = reveal(frame, 30, 24);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, dur), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div style={{ ...fadeUp(reveal(frame, 2, 16), 0) }}>
          <Monogram size={120} p={ring} />
        </div>
        <div
          style={{
            ...fadeUp(reveal(frame, 14, 20)),
            fontFamily: F.serif,
            fontWeight: 400,
            fontSize: 108,
            lineHeight: 1.02,
            textAlign: 'center',
            color: C.ink,
          }}
        >
          Swayed by <span style={{ fontStyle: 'italic', fontWeight: 500 }}>proof.</span>
        </div>
        <div style={{ width: interpolate(rule, [0, 1], [0, 300]), height: 1, background: C.hair }} />
        <div
          style={{
            ...fadeUp(reveal(frame, 40, 20)),
            fontFamily: F.sans,
            fontWeight: 400,
            fontSize: 40,
            letterSpacing: '0.01em',
            textAlign: 'center',
            color: C.slate,
          }}
        >
          Find your fit. Shop with confidence.
        </div>
        <div style={{ ...fadeUp(reveal(frame, 54, 20)), marginTop: 8 }}>
          <Wordmark size={120} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
