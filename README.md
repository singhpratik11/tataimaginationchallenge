# Netto — scroll story

A scroll-driven keynote for **Netto** (Tata Imagination Challenge 2026, Pratik Singh).
Vite + vanilla JS, GSAP for the transitions and builds. The pitch video is deliberately not on the site. Poppins is self-hosted, so it runs offline.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # -> dist/
npm run preview    # serve dist on http://localhost:4173
```

`dist/index.html` has the JS, CSS and fonts inlined, so it also works by **double-clicking it** (no server, no internet).
Keep `dist/assets/` next to it — the card images live there.

## Present

| Key | Does |
| --- | --- |
| → ↓ Space PageDown | next slide (it slides in, then its animations play once) |
| ← ↑ Shift+Space PageUp | previous slide |
| Home / End | first / last slide |
| P | presenter mode: hides dots and hint, shows a `5/18` counter |
| F | fullscreen |
| C | click/tap anywhere to advance (off by default) |

Nothing moves on its own: one key press, one mouse-wheel/trackpad flick or one swipe = one slide. Going back shows the previous slide already built. Build speed is `BUILD_SPEED` / `SLOW_SPEED` at the top of the deck engine in `src/main.js`.

Jump straight to a slide with its hash: `#title #apps #question #gap #loan #beti #unnoticed #news #netto #message #card #try #languages #payoff #why #tata #close #sources`.

`#news` shows four real articles (headlines and quotes exactly as published, each links to the original). They are also listed on `#sources`.

`#try` is an interactive slide: pick *Good week / Slow week / Bike breaks down* or drag the sliders and the card updates live.

PDF backup: open the site in Chrome, then Print → Save as PDF. Each slide prints on its own landscape page, fully built.

## Deploy (Vercel)

```bash
vercel --prod
```

`vercel.json` already sets the build command and `dist` output. Netlify / GitHub Pages: upload the `dist/` folder as-is.

## Checks

```bash
npm run build && npm run preview &
npm run shots              # Chromium: every slide at 1920x1080, 1366x768, 390x844 -> shots/
npm run shots -- webkit    # Safari engine
```

The script flags console errors and any text that falls off screen. `node scripts/nav.mjs` checks keys, click-to-advance, deep links, reduced motion and the file:// build; `node scripts/jank.mjs` counts dropped frames.

## Notes

- Every number on a card or in a chat is an example and carries a "Sample · example numbers" label. Ravi is a composite.
- No platform names or logos: apps are "Delivery app 1", "Delivery app 2", "Ride app". No Tata logo.
- `prefers-reduced-motion`: no builds, parallax or zoom; slides simply cross-fade.
