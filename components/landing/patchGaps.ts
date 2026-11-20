/*
 * The 404 you fix (now-building-and-genz Phase 6): which pixels of the 404's
 * drawing (components/landing/statusArt.ts) arrive missing. Seeded, so every
 * visit loses the same ones, and apart, so each gap's 24 px target
 * (WCAG 2.5.8) clears its neighbours' at every width the drawing is shown at.
 * Only a cell with a filled cell on every side can go missing: a hole inside
 * the picture reads as a gap, a bite out of its edge does not.
 */

/** How many pixels go missing. */
export const GAP_COUNT = 7;

/** The seed: the same gaps every visit. */
const SEED = 404;

/** Cells between two gaps, at least, across or down (Chebyshev distance). */
const APART = 3;

/** A filled cell of a drawing (PixelArt's pixelCells). */
interface Cell {
  readonly x: number;
  readonly y: number;
}

/** A small seeded random (mulberry32): the same sequence for a seed. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The drawing's missing pixels, out of its filled cells, in reading order. */
export function pixelGaps<C extends Cell>(
  cells: readonly C[],
  count = GAP_COUNT,
): C[] {
  const filled = new Set(cells.map(({ x, y }) => `${x}.${y}`));
  const inside = cells.filter(({ x, y }) =>
    [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ].every(([cx, cy]) => filled.has(`${cx}.${cy}`)),
  );
  // Shuffled by the seed (Fisher-Yates), then taken while they stay apart.
  const random = seeded(SEED);
  for (let i = inside.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [inside[i], inside[j]] = [inside[j]!, inside[i]!];
  }
  const gaps: C[] = [];
  for (const cell of inside) {
    if (gaps.length === count) break;
    const clear = gaps.every(
      (gap) =>
        Math.max(Math.abs(gap.x - cell.x), Math.abs(gap.y - cell.y)) >= APART,
    );
    if (clear) gaps.push(cell);
  }
  return gaps.sort((a, b) => a.y - b.y || a.x - b.x);
}
