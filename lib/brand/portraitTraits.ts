/*
 * The pixel portrait's traits (owner, 20-11-26; now-building-and-genz
 * Phase 3): our own drawings painted over the portrait
 * (lib/brand/pixelPortrait.ts), on the 24 x 24 drawing and on the nav's
 * 16 x 16 cut. They live apart from the drawing, which the nav puts in every
 * page's first load: only what draws a trait loads them (/about, the nav once
 * a trait is found, the toast).
 */

/** Cells painted from (row, col) rightwards; a space keeps the cell. */
type Patch = readonly [row: number, col: number, cells: string];

/** A trait: cells painted over the 24 x 24 drawing and the 16 x 16 cut. */
export interface PortraitTrait {
  readonly id: string;
  readonly label: string;
  readonly patches: readonly Patch[];
  /** The same trait on the nav's 16 x 16 cut, drawn to read at 32 px. */
  readonly smallPatches: readonly Patch[];
}

/** Our own traits, in the order a press finds them. */
export const PORTRAIT_TRAITS: readonly PortraitTrait[] = [
  {
    id: "shades",
    label: "Shades",
    patches: [
      [10, 6, "kqqqqkkqqqqk"],
      [11, 7, "kqqk  kqqk"],
      [10, 8, "w"],
      [10, 14, "w"],
    ],
    smallPatches: [
      [7, 4, "wqqkkwqq"],
      [8, 4, "qqq  qqq"],
    ],
  },
  {
    id: "glasses",
    label: "Gold glasses",
    patches: [
      [9, 7, " yy    yy"],
      [10, 7, "y  y"],
      [10, 11, "yy"],
      [10, 13, "y  y"],
      [11, 7, " yy    yy"],
    ],
    smallPatches: [
      [6, 5, "yy  yy"],
      [7, 4, "y  yy  y"],
      [8, 5, "yy  yy"],
    ],
  },
  {
    id: "headphones",
    label: "Headphones",
    patches: [
      [3, 6, "aaaaaaaaaaaa"],
      [4, 5, "a"],
      [4, 18, "a"],
      [5, 4, "a"],
      [5, 19, "a"],
      [6, 4, "a"],
      [6, 19, "a"],
      [7, 4, "a"],
      [7, 19, "a"],
      [8, 3, "kaak"],
      [8, 17, "kaak"],
      [9, 3, "kaak"],
      [9, 17, "kaak"],
      [10, 3, "kaak"],
      [10, 17, "kaak"],
      [11, 3, "kkkk"],
      [11, 17, "kkkk"],
    ],
    smallPatches: [
      [2, 4, "aaaaaaaa"],
      [3, 3, "a"],
      [3, 12, "a"],
      [4, 2, "a"],
      [4, 13, "a"],
      [5, 2, "a"],
      [5, 13, "a"],
      [6, 1, "kaak"],
      [6, 11, "kaak"],
      [7, 1, "kaak"],
      [7, 11, "kaak"],
      [8, 1, "kkkk"],
      [8, 11, "kkkk"],
    ],
  },
  {
    id: "cap",
    label: "Coral cap",
    patches: [
      [1, 7, "kkkkkkkkkk"],
      [2, 6, "kcccccccccck"],
      [3, 5, "kcccccccccccck"],
      [4, 5, "kcccccwccccck"],
      [5, 5, "kcccccccccccck"],
      [6, 5, "kkkkkkkkkkkkkkkk"],
      [6, 14, "kkkkkkkk"],
      [7, 14, "ccccccc"],
      [7, 21, "k"],
      [8, 14, "kkkkkkkk"],
    ],
    smallPatches: [
      [0, 6, "kkkk"],
      [1, 4, "kkcccckk"],
      [2, 3, "kccccwccck"],
      [3, 3, "kkkkkkkkkkkk"],
      [4, 10, "cccck"],
      [5, 10, "kkkkk"],
    ],
  },
  {
    id: "earring",
    label: "Gold earring",
    patches: [
      [12, 3, "ky"],
      [13, 3, "ky"],
    ],
    smallPatches: [
      [8, 1, "ky"],
      [9, 1, "ky"],
    ],
  },
  {
    id: "pin",
    label: "Lapel pin",
    patches: [
      [20, 7, "ya"],
      [21, 7, "aa"],
    ],
    smallPatches: [
      [14, 4, "ya"],
      [15, 4, "aa"],
    ],
  },
];

/** The nav's cut is 16 cells square (PORTRAIT_SMALL). */
const SMALL = 16;

/**
 * The drawing with a trait painted on: the trait's 16 x 16 patches on the
 * nav's cut, its 24 x 24 ones on the full drawing.
 */
export function withTrait(
  rows: readonly string[],
  trait: PortraitTrait | undefined,
): string[] {
  const grid = rows.map((row) => [...row]);
  const patches = rows.length === SMALL ? trait?.smallPatches : trait?.patches;
  for (const [row, col, cells] of patches ?? []) {
    [...cells].forEach((cell, at) => {
      if (cell !== " ") grid[row]![col + at] = cell;
    });
  }
  return grid.map((cells) => cells.join(""));
}

/** The gold edition, for finding every trait: the outline turns gold. */
export function goldEdition(rows: readonly string[]): string[] {
  return rows.map((row) => row.replaceAll("k", "y"));
}

/**
 * The drawing as a visitor has it: wearing their trait (by id), and the gold
 * edition once they have found every one.
 */
export function wornPortrait(
  rows: readonly string[],
  worn: string | null,
  found: number,
): string[] {
  const drawn = withTrait(
    rows,
    PORTRAIT_TRAITS.find((trait) => trait.id === worn),
  );
  return found >= PORTRAIT_TRAITS.length ? goldEdition(drawn) : drawn;
}
