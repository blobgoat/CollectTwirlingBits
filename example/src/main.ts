import { createStarBits } from "collect-twirling-bits";
import type { StarBitsApi } from "collect-twirling-bits";

// ─────────────────────────────────────────────────────────────────────────────
// Initialize the package with debug-friendly options.
//
//   spawnEveryMs  – how often (in ms) a new star bit tries to appear
//   maxOnScreen   – maximum number of bits visible at once
//   starSize      – width & height of each star in pixels
//   storageKey    – localStorage key used to persist the collected total
// ─────────────────────────────────────────────────────────────────────────────
const twirlingBits: StarBitsApi = createStarBits({
  spawnEveryMs: 5000,
  maxOnScreen: 10,
  starSize: 28,
  storageKey: "twirling-bits-total",
  speedOfSpin: 5000
});

// Start spawning immediately when the page loads.
twirlingBits.start();

// ─────────────────────────────────────────────────────────────────────────────
// Wire up the debug control panel buttons.
// Each button calls the corresponding method on the twirlingBits instance.
// ─────────────────────────────────────────────────────────────────────────────

function getButton(id: string): HTMLButtonElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLButtonElement)) {
    throw new Error(`Button #${id} not found in the DOM`);
  }
  return el;
}

// Start (or resume) spawning star bits.
getButton("btn-start").addEventListener("click", () => {
  twirlingBits.start();
  console.log("[twirling-bits] started");
});

// Pause spawning — existing bits stay on screen until collected.
getButton("btn-stop").addEventListener("click", () => {
  twirlingBits.stop();
  console.log("[twirling-bits] stopped");
});

// Tear everything down: clears the interval, removes overlay and counter.
// Call start() again to reinitialise from scratch.
getButton("btn-destroy").addEventListener("click", () => {
  twirlingBits.destroy();
  console.log("[twirling-bits] destroyed");
});

// Reset the persistent total to 0 (also clears the counter on screen).
getButton("btn-reset").addEventListener("click", () => {
  twirlingBits.setTotal(0);
  console.log("[twirling-bits] total reset to 0");
});

// Print the current total to the console without changing anything.
getButton("btn-log").addEventListener("click", () => {
  const total = twirlingBits.getTotal();
  console.log(`[twirling-bits] current total: ${total}`);
});
