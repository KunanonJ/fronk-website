import { useEffect, useRef } from "react";
import { bayerRank } from "@/components/ds/ditherCells";
import { waitForFirstView } from "@/lib/motion/firstView";
import { cn } from "@/lib/utils/cn";

/*
 * Pixel art drawn in code (profile redesign, design spec 7.7): one square per
 * cell, coloured by a token class, so it follows the theme and holds no raw
 * hex. Decorative: aria-hidden, no text. A row is a string, one character per
 * cell; a character with no tone is left empty.
 *
 * With `play` (the footer's drawings: "a one-time animation of 3 s or less on
 * reveal, then still"), a drawing still below the fold after hydration waits
 * hidden (`data-wait`, shell.css) and plays once as it comes into view
 * (lib/motion/firstView.ts), in the beats of `pixelBeats`. On screen, under
 * reduced motion, hidden, or without the Web Animations API, it is simply
 * there.
 */

const TONE = {
  k: "ink",
  w: "paper",
  t: "soft",
  g: "tint",
  a: "accent",
  c: "coral",
} as const;

type PixelTone = (typeof TONE)[keyof typeof TONE];

interface PixelCell {
  readonly x: number;
  readonly y: number;
  readonly tone: PixelTone;
}

/** The filled cells of a pixel drawing, in reading order. */
export function pixelCells(rows: readonly string[]): PixelCell[] {
  const cells: PixelCell[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const tone = TONE[char as keyof typeof TONE];
      if (tone) cells.push({ x, y, tone });
    });
  });
  return cells;
}

/** The beats, in ms: the matrix's 16 steps, then the content, then the last. */
const PRINT_STEP_MS = 40;
const CONTENT_MS = 700;
const ROW_MS = 50;
const LAST_MS = 1350;
const BLINK_MS = 150;

interface PixelBeat {
  /** When the cell appears, in ms from the start. */
  readonly delay: number;
  /** A light: it goes off once, BLINK_MS after it appears, then stays on. */
  readonly blink: boolean;
}

/**
 * When each cell of a drawing appears as it plays, in the order of
 * `pixelCells`. The paper and the frame print in by the dither's 4 x 4
 * matrix (as a DitherField prints in); then the content (tint) loads row by
 * row; then what comes last: ink inside the frame (the cursor, the phone's
 * button) and the lights (accent, coral), which blink once. Under 1.7 s.
 */
export function pixelBeats(rows: readonly string[]): PixelBeat[] {
  const width = Math.max(0, ...rows.map((row) => row.length));
  return pixelCells(rows).map(({ x, y, tone }) => {
    const edge = x === 0 || y === 0 || x === width - 1 || y === rows.length - 1;
    if (tone === "tint")
      return { delay: CONTENT_MS + y * ROW_MS, blink: false };
    if (tone === "accent" || tone === "coral")
      return { delay: LAST_MS, blink: true };
    if (tone === "ink" && !edge) return { delay: LAST_MS, blink: false };
    return { delay: bayerRank(x, y) * PRINT_STEP_MS, blink: false };
  });
}

/**
 * Hidden for the animation's span: its delay before, its duration while.
 * Visibility, not opacity: a square animating its opacity is painted on its
 * own, and its crisp edges then leave hairline seams beside its neighbours.
 */
const HIDDEN: Keyframe[] = [{ visibility: "hidden" }, { visibility: "hidden" }];

/** Plays a drawing's beats on its squares (the svg's rects, in cell order). */
function playBeats(svg: SVGSVGElement, beats: readonly PixelBeat[]): void {
  svg.querySelectorAll("rect").forEach((rect, i) => {
    const beat = beats[i];
    if (!beat) return;
    rect.animate(HIDDEN, { delay: beat.delay, duration: 1, fill: "backwards" });
    if (beat.blink) {
      rect.animate(HIDDEN, {
        delay: beat.delay + BLINK_MS,
        duration: BLINK_MS,
      });
    }
  });
}

export function PixelArt({
  rows,
  play = false,
  className,
}: {
  rows: readonly string[];
  /** Plays once on reveal (the footer's drawings). */
  play?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const width = Math.max(0, ...rows.map((row) => row.length));

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !play || typeof svg.animate !== "function") return;
    const stop = waitForFirstView(svg, () => {
      playBeats(svg, pixelBeats(rows));
      svg.removeAttribute("data-wait");
    });
    if (!stop) return;
    svg.setAttribute("data-wait", "");
    return () => {
      stop();
      svg.removeAttribute("data-wait");
    };
  }, [play, rows]);

  return (
    <svg
      ref={ref}
      className={cn("pf-art", className)}
      viewBox={`0 0 ${width} ${rows.length}`}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {pixelCells(rows).map((cell) => (
        <rect
          key={`${cell.x}.${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={1}
          height={1}
          className={`pf-px pf-px--${cell.tone}`}
        />
      ))}
    </svg>
  );
}
