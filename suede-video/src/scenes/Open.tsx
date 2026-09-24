import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { C, F } from '../theme';
import { Monogram, Wordmark, Eyebrow } from '../components/Marks';
import { reveal, fadeUp, sceneFade } from '../components/anim';

export const OpenScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = spring({ frame, fps, config: { damping: 200, mass: 0.9 }, durationInFrames: 34 });
  const rule = reveal(frame, 46, 26);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, dur), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <div style={{ ...fadeUp(reveal(frame, 4, 18), 0) }}>
          <Monogram size={150} p={ring} />
        </div>
        <div style={{ ...fadeUp(reveal(frame, 22, 20)) }}>
          <Wordmark size={196} />
        </div>
        <div style={{ width: interpolate(rule, [0, 1], [0, 320]), height: 1, background: C.hair, marginTop: 4 }} />
        <div style={{ ...fadeUp(reveal(frame, 52, 20)) }}>
          <Eyebrow>Swayed by proof</Eyebrow>
        </div>
      </div>
    </AbsoluteFill>
  );
};
