import type { CSSProperties } from "react";
import { INTRO_TIMING } from "@/lib/content/introGreetings";

/*
 * The intro's arrival burst (owner, 09-11-26): a champagne pop (gold ring and
 * flash), a fan of confetti that shoots up and falls back, and sparkles
 * around "Welcome to KunanonJ". CSS only (globals.css, `.intro-*`), palette
 * tokens only, and inert under reduced motion (the intro never runs then,
 * and the burst CSS sits behind prefers-reduced-motion: no-preference).
 * Paths are seeded, so every visit plays the same burst.
 */

const CONFETTI_COLOURS = [
  "var(--accent)",
  "var(--ember)",
  "var(--scene-gold-2)",
  "var(--scene-gold-3)",
  "var(--cta)",
] as const;

const SPARKLE_COLOURS = [
  "var(--scene-gold-2)",
  "var(--scene-gold-3)",
  "var(--accent)",
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

type Piece = { style: CSSProperties; delay: number; duration: number };

const px = (n: number) => `${Math.round(n)}px`;

function confetti(count = 30): Piece[] {
  const rand = seeded(2026);
  return Array.from({ length: count }, (_, i) => {
    // Upward fan, -160deg to -20deg, like a cork's spray.
    const angle = ((-160 + rand() * 140) * Math.PI) / 180;
    const distance = 140 + rand() * 200;
    const delay = Math.round(rand() * 60);
    const duration = Math.round(560 + rand() * 120);
    const square = i % 3 === 0;
    return {
      delay,
      duration,
      style: {
        "--x": px(Math.cos(angle) * distance),
        "--y": px(Math.sin(angle) * distance),
        "--fall": px(120 + rand() * 100),
        "--r": `${Math.round(-540 + rand() * 1080)}deg`,
        "--w": square ? "7px" : `${6 + Math.round(rand() * 2)}px`,
        "--h": square ? "7px" : `${10 + Math.round(rand() * 4)}px`,
        "--c": CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
        "--d": `${duration}ms`,
        "--delay": `${delay}ms`,
      } as CSSProperties,
    };
  });
}

function sparkles(count = 8): Piece[] {
  const rand = seeded(7);
  return Array.from({ length: count }, (_, i) => {
    const delay = Math.round(40 + rand() * 140);
    return {
      delay,
      duration: 560,
      style: {
        "--x": px(-260 + rand() * 520),
        "--y": px(-110 + rand() * 150),
        "--s": px(10 + rand() * 8),
        "--c": SPARKLE_COLOURS[i % SPARKLE_COLOURS.length],
        "--delay": `${delay}ms`,
      } as CSSProperties,
    };
  });
}

const CONFETTI = confetti();
const SPARKLES = sparkles();

/** The longest piece, so tests can hold the burst to INTRO_TIMING.burstMs. */
export const INTRO_BURST_MS = Math.max(
  520,
  ...[...CONFETTI, ...SPARKLES].map((p) => p.delay + p.duration),
);

if (INTRO_BURST_MS > INTRO_TIMING.burstMs) {
  throw new Error("Intro burst outlasts INTRO_TIMING.burstMs");
}

export default function IntroBurst() {
  return (
    <div aria-hidden data-testid="intro-burst">
      <div className="intro-burst" style={{ top: "calc(50% + 1.75rem)" }}>
        <span className="intro-flash" />
        <span className="intro-pop" />
        {CONFETTI.map((piece, i) => (
          <span key={i} className="intro-confetti" style={piece.style} />
        ))}
      </div>
      <div className="intro-burst">
        {SPARKLES.map((piece, i) => (
          <span key={i} className="intro-sparkle" style={piece.style} />
        ))}
      </div>
    </div>
  );
}
