import type { ReactNode } from "react";
import type { PixelTone } from "@/lib/landing/journey";
import { cn } from "@/lib/utils/cn";

/*
 * Pixel tiles for the Journey orbit (profile redesign Phase 4, design spec
 * 8.6; umbrella input R18, its default): our own pixel badge per tool, built
 * from the two-letter mono badge /stack shows, in a palette colour; and a
 * pixel document for the decorative file tiles. Not the tools' brand marks.
 *
 * Server-rendered SVG on a 24 x 24 grid, crisp at any size and zoom. Colours
 * come from tokens through the `pf-px--{tone}` classes in
 * src/styles/profile/home-journey.css. Decorative: the tool's name is the
 * text beside it, so the art is hidden from assistive technology.
 */

type Cell = readonly [x: number, y: number];

/** Our own 5 x 7 capitals, for the letters the /stack badges use. */
export const PIXEL_LETTERS: Readonly<Record<string, readonly string[]>> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "10001", "11001", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
};

const GRID = 24;

/** Cells of the letters, centred on the 24 grid; unknown letters draw nothing. */
export function glyphCells(letters: string): Cell[] {
  const chars = [...letters.toUpperCase()].slice(0, 2);
  const width = chars.length * 6 - 1;
  const x0 = Math.floor((GRID - width) / 2);
  const cells: Cell[] = [];
  chars.forEach((char, index) => {
    const rows = PIXEL_LETTERS[char];
    if (!rows) return;
    rows.forEach((row, y) => {
      [...row].forEach((bit, x) => {
        if (bit === "1") cells.push([x0 + index * 6 + x, 8 + y]);
      });
    });
  });
  return cells;
}

/** The cells inside a predicate, row by row. */
function cellsWhere(inside: (x: number, y: number) => boolean): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < GRID; y += 1)
    for (let x = 0; x < GRID; x += 1) if (inside(x, y)) cells.push([x, y]);
  return cells;
}

/** One path for a set of cells: each row's runs as rectangles. */
export function pixelPath(cells: readonly Cell[]): string {
  const byRow = new Map<number, number[]>();
  for (const [x, y] of cells) byRow.set(y, [...(byRow.get(y) ?? []), x]);
  let d = "";
  for (const [y, xs] of [...byRow.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...new Set(xs)].sort((a, b) => a - b);
    let start = sorted[0]!;
    let prev = start;
    for (const x of [...sorted.slice(1), Number.NaN]) {
      if (x === prev + 1) {
        prev = x;
        continue;
      }
      d += `M${start} ${y}h${prev - start + 1}v1h-${prev - start + 1}z`;
      start = x;
      prev = x;
    }
  }
  return d;
}

const inBadge = (x: number, y: number) =>
  (x >= 3 && x <= 20 && y >= 1 && y <= 22) ||
  (x >= 1 && x <= 22 && y >= 3 && y <= 20) ||
  (x >= 2 && x <= 21 && y >= 2 && y <= 21);

const BADGE_BODY = pixelPath(cellsWhere(inBadge));
/** A darker bottom and right edge, and a light top and left edge. */
const BADGE_SHADE = pixelPath(
  cellsWhere(
    (x, y) =>
      (y === 22 && x >= 3 && x <= 20) || (x === 22 && y >= 3 && y <= 20),
  ),
);
const BADGE_GLINT = pixelPath(
  cellsWhere(
    (x, y) => (y === 2 && x >= 3 && x <= 19) || (x === 2 && y >= 3 && y <= 19),
  ),
);

/** A sheet with a folded corner, three lines of text and a coloured band. */
const FILE_EDGE = pixelPath(
  cellsWhere(
    (x, y) =>
      (y === 1 && x >= 4 && x <= 15) ||
      (x === 3 && y >= 2 && y <= 22) ||
      (y === 22 && x >= 4 && x <= 19) ||
      (x === 20 && y >= 7 && y <= 21) ||
      (x === 16 && y >= 1 && y <= 6) ||
      (y === 6 && x >= 16 && x <= 19) ||
      (x - y === 15 && x >= 17 && x <= 19),
  ),
);
const FILE_SHEET = pixelPath(
  cellsWhere(
    (x, y) =>
      (x >= 4 && x <= 15 && y >= 2 && y <= 21) ||
      (x >= 16 && x <= 19 && y >= 7 && y <= 21),
  ),
);
const FILE_LINES = pixelPath(
  cellsWhere((x, y) => x >= 6 && x <= 13 && (y === 5 || y === 8 || y === 11)),
);
const FILE_BAND = pixelPath(
  cellsWhere((x, y) => x >= 4 && x <= 19 && y >= 15 && y <= 19),
);

function Pixels({
  tone,
  className,
  children,
}: {
  tone: PixelTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      shapeRendering="crispEdges"
      className={cn("pf-px", `pf-px--${tone}`, className)}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** A tool's badge: its two letters on a rounded pixel tile. */
export function PixelBadge({
  badge,
  tone,
  className,
}: {
  badge: string;
  tone: PixelTone;
  className?: string;
}) {
  return (
    <Pixels tone={tone} className={className}>
      <path className="pf-px__body" d={BADGE_BODY} />
      <path className="pf-px__glint" d={BADGE_GLINT} />
      <path className="pf-px__shade" d={BADGE_SHADE} />
      <path className="pf-px__glyph" d={pixelPath(glyphCells(badge))} />
    </Pixels>
  );
}

/** A decorative file: a sheet with a coloured band. */
export function PixelFile({
  tone,
  className,
}: {
  tone: PixelTone;
  className?: string;
}) {
  return (
    <Pixels tone={tone} className={className}>
      <path className="pf-px__sheet" d={FILE_SHEET} />
      <path className="pf-px__edge" d={FILE_EDGE} />
      <path className="pf-px__lines" d={FILE_LINES} />
      <path className="pf-px__body" d={FILE_BAND} />
    </Pixels>
  );
}
