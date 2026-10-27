import React from 'react';
import { Composition } from 'remotion';
import { SuedeProduct, TOTAL } from './SuedeProduct';
import {
  CapsulePost,
  CAPSULE_POST_TOTAL,
  CapsuleScrollOverlay,
  CAPSULE_SCROLL_OVERLAY_W,
} from './scenes/CapsulePost';
import { Fonts } from './fonts';
import { VIDEO } from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SuedeProduct"
        component={SuedeProduct}
        durationInFrames={TOTAL}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      {/* Instagram feed post (4:5) — "THE CAPSULE · Early Access Open" */}
      <Composition
        id="CapsulePost"
        component={() => (
          <>
            <Fonts />
            <CapsulePost />
          </>
        )}
        durationInFrames={CAPSULE_POST_TOTAL}
        fps={30}
        width={1080}
        height={1350}
      />
      {/* Transparent overlay — just the scrolling cutout column (render as VP9 WebM with alpha) */}
      <Composition
        id="CapsuleScrollOverlay"
        component={CapsuleScrollOverlay}
        durationInFrames={CAPSULE_POST_TOTAL}
        fps={30}
        width={CAPSULE_SCROLL_OVERLAY_W}
        height={1350}
      />
    </>
  );
};
