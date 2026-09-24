import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { Backdrop } from './components/Backdrop';
import { Fonts } from './fonts';
import { OpenScene } from './scenes/Open';
import { HookScene } from './scenes/Hook';
import { CollectiveScene } from './scenes/Collective';
import { MatchScene } from './scenes/Match';
import { CapsuleScene } from './scenes/Capsule';
import { CTAScene } from './scenes/CTA';

// Scene durations (frames @30fps) — total 720 = 24s.
export const SCENES = {
  open: 105,
  hook: 120,
  collective: 165,
  match: 120,
  capsule: 105,
  cta: 105,
};
export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0);

export const SuedeProduct: React.FC = () => {
  return (
    <AbsoluteFill>
      <Fonts />
      <Backdrop>
        <Series>
          <Series.Sequence durationInFrames={SCENES.open}>
            <OpenScene dur={SCENES.open} />
          </Series.Sequence>
          <Series.Sequence durationInFrames={SCENES.hook}>
            <HookScene dur={SCENES.hook} />
          </Series.Sequence>
          <Series.Sequence durationInFrames={SCENES.collective}>
            <CollectiveScene dur={SCENES.collective} />
          </Series.Sequence>
          <Series.Sequence durationInFrames={SCENES.match}>
            <MatchScene dur={SCENES.match} />
          </Series.Sequence>
          <Series.Sequence durationInFrames={SCENES.capsule}>
            <CapsuleScene dur={SCENES.capsule} />
          </Series.Sequence>
          <Series.Sequence durationInFrames={SCENES.cta}>
            <CTAScene dur={SCENES.cta} />
          </Series.Sequence>
        </Series>
      </Backdrop>
    </AbsoluteFill>
  );
};
