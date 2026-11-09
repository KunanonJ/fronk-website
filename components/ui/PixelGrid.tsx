import { cn } from "@/lib/utils/cn";

export type PixelState = "idle" | "live" | "failed";

type Cell = { x: number; y: number; tone: "signal" | "glaze" | "ember" };

/** Mulberry32: tiny deterministic PRNG, so server and client render the same grid. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cells for a grid. `density` (0-1) is the share of filled squares. Ember
 * cells exist only for `live` or `failed`, the palette rule: Ember means
 * something is firing or has failed. Exported for tests.
 */
export function pixelCells({
  cols,
  rows,
  seed,
  density,
  state,
}: {
  cols: number;
  rows: number;
  seed: number;
  density: number;
  state: PixelState;
}): Cell[] {
  const rand = seeded(seed);
  const cells: Cell[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const r = rand();
      if (r > density) continue;
      cells.push({ x, y, tone: r < density * 0.45 ? "signal" : "glaze" });
    }
  }
  if (state !== "idle" && cells.length > 0) {
    const emberCount = state === "failed" ? 3 : 2;
    for (let i = 0; i < emberCount; i += 1) {
      const index = Math.floor(rand() * cells.length);
      cells[index] = { ...cells[index]!, tone: "ember" };
    }
  }
  return cells;
}

const FILL: Record<Cell["tone"], string> = {
  signal: "fill-signal",
  // Glaze is bright on dark surfaces, so dark mode uses a faint hairline tint.
  glaze: "fill-glaze dark:fill-hairline-strong",
  ember: "fill-ember",
};

/**
 * Deterministic pixel-square motif (visual-redesign Phase 0). Decorative by
 * default (`aria-hidden`); pass `label` to expose it as an image. The `live`
 * state gently pulses its Ember squares, unless reduced motion is on.
 */
export function PixelGrid({
  cols = 16,
  rows = 6,
  seed = 7,
  density = 0.45,
  state = "idle",
  cell = 12,
  gap = 3,
  label,
  className,
}: {
  cols?: number;
  rows?: number;
  seed?: number;
  density?: number;
  state?: PixelState;
  /** Square size in SVG units. */
  cell?: number;
  gap?: number;
  label?: string;
  className?: string;
}) {
  const cells = pixelCells({ cols, rows, seed, density, state });
  const step = cell + gap;
  const width = cols * step - gap;
  const height = rows * step - gap;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("block h-auto w-full", className)}
      data-state={state}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      {cells.map(({ x, y, tone }) => (
        <rect
          key={`${x}-${y}`}
          x={x * step}
          y={y * step}
          width={cell}
          height={cell}
          className={cn(
            FILL[tone],
            tone === "ember" && state === "live" && "motion-safe:animate-pulse",
          )}
        />
      ))}
    </svg>
  );
}
