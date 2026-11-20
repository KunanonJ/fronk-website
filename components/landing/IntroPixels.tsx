import type { CSSProperties } from "react";
import { INTRO_TIMING } from "@/lib/content/introGreetings";

/*
 * The welcome's burst (owner, 20-11-26): square pixels in the site's colours
 * fly out from the minted portrait and fade, the site's own material instead
 * of confetti. CSS only (globals.css, `.intro-pixel`, under no-preference),
 * seeded, so every visit plays the same burst; over within the welcome's hold.
 */

const COLOURS = [
  "var(--accent)",
  "var(--ember)",
  "var(--peach)",
  "var(--tint-3)",
] as const;

/** Small deterministic PRNG (mulberry32). */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The burst's pixels, all over by this many ms. */
export const INTRO_PIXELS_MS = 620;

const PIXELS = (() => {
  const random = seeded(576);
  return Array.from({ length: 28 }, (_, at) => {
    const angle = (at / 28) * Math.PI * 2 + random() * 0.3;
    const reach = 130 + random() * 90;
    const delay = Math.round(random() * 80);
    return {
      "--x": `${Math.round(Math.cos(angle) * reach)}px`,
      "--y": `${Math.round(Math.sin(angle) * reach)}px`,
      "--s": `${[8, 8, 12][at % 3]}px`,
      "--c": COLOURS[at % COLOURS.length],
      "--delay": `${delay}ms`,
      "--d": `${INTRO_PIXELS_MS - delay}ms`,
    } as CSSProperties;
  });
})();

export default function IntroPixels() {
  return (
    <div
      data-testid="intro-pixels"
      aria-hidden="true"
      className="intro-pixels"
      data-burst-ms={INTRO_TIMING.burstMs}
    >
      {PIXELS.map((style, at) => (
        <span key={at} className="intro-pixel" style={style} />
      ))}
    </div>
  );
}
