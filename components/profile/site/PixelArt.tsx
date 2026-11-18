import { cn } from "@/lib/utils/cn";

/*
 * Pixel art drawn in code (profile redesign, design spec 7.7): one square per
 * cell, coloured by a token class, so it follows the theme and holds no raw
 * hex. Decorative: aria-hidden, no text. A row is a string, one character per
 * cell; a character with no tone is left empty.
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

export function PixelArt({
  rows,
  className,
}: {
  rows: readonly string[];
  className?: string;
}) {
  const width = Math.max(0, ...rows.map((row) => row.length));
  return (
    <svg
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
