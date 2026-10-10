# Netto — scroll story

A scroll-driven keynote for **Netto** (Tata Imagination Challenge 2026, Pratik Singh).
Vite + vanilla JS, GSAP ScrollTrigger for the builds, Lenis for smooth scroll. Poppins is self-hosted, so it runs offline.

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
Keep `dist/assets/` next to it — images and video live there.

## Present

| Key | Does |
| --- | --- |
| → ↓ Space PageDown | next slide (plays that slide's build) |
| ← ↑ Shift+Space PageUp | previous slide |
| Home / End | first / last slide |
| P | presenter mode: hides dots and hint, shows `5/18` counter |
| F | fullscreen |
| C | click/tap anywhere to advance (on by default on laptops, off on phones) |

Jump straight to a slide with its hash: `#title #apps #question #gap #loan #beti #unnoticed #netto #message #card #try #languages #payoff #why #tata #watch #close #sources`.

`#try` is an interactive slide: pick *Good week / Slow week / Bike breaks down* or drag the sliders and the card updates live.

PDF backup: open the site in Chrome, press `End` once (loads the video poster), then Print → Save as PDF. Each slide prints on its own landscape page, fully built.

## Swap the video

Replace `public/assets/video/netto-pitch.mp4` with the final cut (same file name), then rebuild/redeploy. To keep it small:

```bash
ffmpeg -i Netto_Final.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart public/assets/video/netto-pitch.mp4
```

The poster is `public/assets/video/poster.webp`. If the narration changes, update the transcript block in `index.html` (search for `id="transcript"`).

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

The script flags console errors and any text that falls off screen.

## Notes

- Every number on a card or in a chat is an example and carries a "Sample · example numbers" label. Ravi is a composite.
- No platform names or logos: apps are "Delivery app 1", "Delivery app 2", "Ride app". No Tata logo.
- `prefers-reduced-motion`: no pinning, parallax or zoom; slides simply fade in.
