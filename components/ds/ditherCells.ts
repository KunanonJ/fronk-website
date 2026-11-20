/*
 * The pixel texture behind skies, cards and tiles (profile redesign, design
 * spec 6.8): an ordered 4 x 4 Bayer threshold over a density ramp. Pure and
 * deterministic, so a field draws the same cells for the same size and seed,
 * and tests can pin it.
 */

/** The 4 x 4 Bayer matrix, values 0 to 15. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;

/** A cell's place in the matrix, 0 to 15, for column `x` and row `y`. */
export function bayerRank(x: number, y: number): number {
  return BAYER[(y % 4) * 4 + (x % 4)]!;
}

export interface DitherOptions {
  /** Field size in CSS px. */
  readonly width: number;
  readonly height: number;
  /** Cell size in CSS px (the spec's 10). */
  readonly cell?: number;
  /** The edge the field thins toward. */
  readonly fade?: "down" | "up" | "left" | "right";
  /** Shifts the matrix, so neighbouring fields differ. */
  readonly seed?: number;
  /** Ramp exponent: 1 thins linearly, 2 (the default) thins faster. */
  readonly falloff?: number;
}

export interface DitherCell {
  /** Column and row, in cells. */
  readonly x: number;
  readonly y: number;
  /** The ramp at this cell, 1 at the dense edge and 0 at the far one. */
  readonly level: number;
  /**
   * The cell's place in the matrix, 0 to 15: the order it prints in when a
   * field prints in (DitherField), the lowest first.
   */
  readonly rank: number;
}

export function ditherCells({
  width,
  height,
  cell = 10,
  fade = "down",
  seed = 0,
  falloff = 2,
}: DitherOptions): DitherCell[] {
  if (width <= 0 || height <= 0 || cell <= 0) return [];
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const shift = Math.abs(Math.trunc(seed));
  const dx = shift % 4;
  const dy = Math.floor(shift / 4) % 4;
  const cells: DitherCell[] = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const level =
        fade === "down"
          ? 1 - y / rows
          : fade === "up"
            ? (y + 1) / rows
            : fade === "left"
              ? 1 - x / cols
              : (x + 1) / cols;
      const rank = bayerRank(x + dx, y + dy);
      const threshold = (rank + 0.5) / 16;
      if (level ** falloff > threshold) cells.push({ x, y, level, rank });
    }
  }
  return cells;
}
