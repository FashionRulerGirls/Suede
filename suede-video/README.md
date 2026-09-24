# Suede — Product Video (Remotion)

A vertical 9:16 product promo for Suede, built with [Remotion](https://remotion.dev).
Editorial motion in the brand system: warm paper, Cormorant Garamond / Jost /
Darker Grotesque, ink black with denim + green signals.

- **Output:** 1080×1920, 30fps, ~24s → `out/suede-product.mp4`
- **Scenes:** monogram open → "Yours." hook → The Collective (member cards +
  Suede Match) → 94% Suede Match ring → The Capsule brand marquee → "Swayed by
  proof." close.

## Run it

```bash
npm install
npm run studio      # open the Remotion editor to preview/scrub/tweak
npm run render      # render out/suede-product.mp4
npm run still       # render a single frame (out/frame.png)
```

Rendering needs Chrome/Chromium. If Remotion can't find one, pass a
chrome-headless-shell binary:

```bash
npx remotion render SuedeProduct out/suede-product.mp4 \
  --browser-executable="/path/to/chrome-headless-shell"
```

## Structure

```
src/
  Root.tsx          Composition registration (id, size, fps, duration)
  SuedeProduct.tsx  Scene timeline (Series) + scene durations
  theme.ts          Brand colors / fonts / video dims
  fonts.tsx         Self-hosted @font-face loading (blocks render until ready)
  components/       Backdrop, Marks (monogram/wordmark/eyebrow), Card bits, anim
  scenes/           Open, Hook, Collective, Match, Capsule, CTA
public/fonts/       Cormorant Garamond, Jost, Darker Grotesque (woff2)
```

## Easy edits

- **Length / pacing:** `SCENES` in `src/SuedeProduct.tsx` (frames @30fps).
- **Copy:** each file in `src/scenes/`.
- **Members / brands:** `MEMBERS` in `scenes/Collective.tsx`, `ROW_A/ROW_B` in
  `scenes/Capsule.tsx`.
- **Colors / fonts:** `src/theme.ts`.
- **Format:** change `VIDEO` in `theme.ts` (e.g. 1080×1350 for IG feed,
  1920×1080 for a site hero) and re-check scene layouts.
