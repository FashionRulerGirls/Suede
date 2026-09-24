import React, { useEffect, useState } from 'react';
import { staticFile, delayRender, continueRender } from 'remotion';

// Self-hosted brand fonts. Loaded via the FontFace API and awaited with
// delayRender so text is never rasterised in a fallback face during a render.
const FACES: Array<[string, number, 'normal' | 'italic', string]> = [
  ['Cormorant Garamond', 400, 'normal', 'cormorant-400'],
  ['Cormorant Garamond', 500, 'normal', 'cormorant-500'],
  ['Cormorant Garamond', 600, 'normal', 'cormorant-600'],
  ['Cormorant Garamond', 500, 'italic', 'cormorant-italic-500'],
  ['Jost', 400, 'normal', 'jost-400'],
  ['Jost', 500, 'normal', 'jost-500'],
  ['Darker Grotesque', 600, 'normal', 'darker-600'],
  ['Darker Grotesque', 700, 'normal', 'darker-700'],
];

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('load-fonts'));
  useEffect(() => {
    Promise.all(
      FACES.map(async ([family, weight, style, file]) => {
        const face = new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {
          weight: String(weight),
          style,
          display: 'block',
        });
        await face.load();
        (document.fonts as unknown as FontFaceSet).add(face);
      }),
    )
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  return null;
};
