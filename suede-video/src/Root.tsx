import React from 'react';
import { Composition } from 'remotion';
import { SuedeProduct, TOTAL } from './SuedeProduct';
import { VIDEO } from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SuedeProduct"
      component={SuedeProduct}
      durationInFrames={TOTAL}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
