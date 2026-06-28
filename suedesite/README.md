# Suede — Discovery Site (Next.js implementation)

Production implementation of the **Suede Discovery Site** design — *"the trust layer
for fashion."* Ported from the Claude Design handoff prototypes in
`../project/ui_kits/suede/` to a real **Next.js 14 + React 18 + TypeScript** app.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Architecture

The prototype was a Babel-in-the-browser SPA: a single `<App>` route-state machine
that swapped full-screen React components, all reading a design-system component
library and sample data off `window`. This port keeps that faithful structure while
turning every piece into a real ES module.

- `app/layout.tsx` — root layout; loads the global token CSS.
- `app/globals.css` — entry point that `@import`s the design tokens **as-is** from
  `app/tokens/` (`fonts`, `colors`, `typography`, `spacing`, `base`) plus the hero
  pulse keyframes from the original `index.html`.
- `app/page.tsx` → `components/App.tsx` — the client app shell. Holds `route` +
  `authed` state, scroll management, and applies the live "Tweaks" CSS-variable
  overrides, exactly like the prototype's `index.html`.
- `components/ds/` — the 22 design-system primitives (Button, BrandCard, ReviewCard,
  Icon, Logo, StarRating, …) as flat `.tsx` files with a barrel `index.ts`. They use
  the token CSS custom properties verbatim.
- `components/screens/` — all 27 screens (Landing, Capsule, Lookbook, Brand, profiles,
  reviews/inquiries, auth flows, quiz, consultation, …) plus shared chrome (`Nav`,
  `Footer`) and shared sub-components (`SignInGate`, `FullMeasureRow`, `InquiryCard`
  exported from `LookbookScreen`).
- `components/TweaksPanel.tsx` — the floating design "Tweaks" panel.
- `lib/data.ts` — sample brands/reviews/members/inquiries/notifications (all fictional).
- `lib/appState.ts` — shared selection state (the prototype's `window.__brand` etc.).
- `lib/listControls.tsx` — shared Search / Sort / Filter controls (`SuedeControls`).
- `lib/claude.ts` — offline stub for the design tool's `window.claude.complete`, used
  by the measurement quiz.
- `public/assets/` — brand SVGs, model cut-outs, avatars, and imagery.

## Notes

- Token CSS is reused unchanged from the design system, per the design brief.
- Routing is the prototype's in-app state machine (shared `Nav`/`Footer`, a Tweaks
  panel, and internal auth transitions). It can later be lifted to Next file-based
  routes if deep-linking is needed.
- All brand names, reviewers, and copy are **fictional sample content**.
- Font substitution: *Glacial Indifference* → **Jost** (see the design system readme).
