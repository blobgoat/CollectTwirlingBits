# collect-twirling-bits — Example Website

A local Vite + TypeScript app for developing and debugging the `collect-twirling-bits` package.

## Running the example

```bash
cd example
npm install
npm run dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

> **Note:** You do **not** need to build the parent package first. The Vite
> alias in `vite.config.ts` points directly at `../src/index.ts` so changes
> to the package source are reflected instantly on save.

## What's on the page

| Section | Purpose |
|---|---|
| **Hero Text Avoidance Test** | Large heading and paragraph — bits should avoid landing on the text |
| **Card Layout Test** | Grid of cards — tests avoidance around shorter text blocks with surrounding whitespace |
| **Dense Paragraph Test** | Wall-to-wall wrapped text — bits should almost never spawn here |
| **Open Space Spawn Test** | Large blank area — bits should appear here frequently |
| **Scroll Test** | Tall section to verify bits stay in the viewport while scrolling |

## Debug controls

The fixed bar at the top of the page has five buttons:

| Button | Method called | Effect |
|---|---|---|
| **Start** | `twirlingBits.start()` | Begin (or resume) spawning bits |
| **Stop** | `twirlingBits.stop()` | Pause spawning; bits already on screen stay |
| **Destroy** | `twirlingBits.destroy()` | Remove overlay, counter, and stop everything |
| **Reset Total** | `twirlingBits.setTotal(0)` | Set the persistent counter back to 0 |
| **Log Total** | `twirlingBits.getTotal()` | Print the current total to the browser console |

## Other npm scripts

```bash
npm run build    # TypeScript check + Vite production build
npm run preview  # Serve the production build locally
```
