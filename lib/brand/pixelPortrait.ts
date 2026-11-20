import { bayerRank } from "@/components/ds/ditherCells";

/*
 * The pixel portrait (owner, 20-11-26; research
 * punk-avatar-and-intro_RESEARCH_20-11-26.md): an original portrait of him in
 * the small, flat style of 24 x 24 pixel portraits. Drawn from his photo: the
 * spiky black hair and side-swept fringe, the toothy smile, the navy blazer
 * over an open white collar. It is our own drawing, not a CryptoPunk or its
 * trait art, and the site never uses that name.
 *
 * One character per cell, a row per string. "." is the background, which
 * takes the site's colour where it is drawn; every other character has a fixed
 * colour, so he looks the same in both themes. The 16 x 16 cut serves the
 * nav's 32 px avatar at a whole 2x (a 24 grid would smear at 32 px). Traits
 * are patches on the 24 x 24 drawing, found on /about.
 */

/** The drawing's colours (the background is not here: it follows the site). */
export const PORTRAIT_COLOURS = {
  k: "#120e1f", // outline
  h: "#1c1b22", // hair
  s: "#e2a27c", // skin
  d: "#c4835e", // skin shade
  w: "#ffffff", // whites: eyes, teeth, collar
  e: "#120e1f", // pupils
  m: "#8a3b2f", // mouth
  n: "#1f2a52", // blazer
  b: "#141c3a", // blazer shade
  q: "#2a2440", // shades' lenses
  a: "#6e3cff", // violet: headphones, the pin
  c: "#ff7a3d", // coral: the cap
  y: "#e3b341", // gold: glasses, earring, the gold edition
} as const;

/** The background's colour where no stylesheet applies (the icons). */
export const PORTRAIT_BACKGROUND = "#8d6bff";

/** The portrait, 24 x 24. */
export const PORTRAIT: readonly string[] = [
  "........................",
  "........................",
  "........k.k..k.k........",
  ".......khkhkkhkhk.......",
  "......khhhhhhhhhhk......",
  ".....khhhhhhhhhhhhk.....",
  ".....khhhhhhhhhhhhk.....",
  ".....khhhhhhhhhhhhk.....",
  ".....khhhssshhshhhk.....",
  ".....kdsssssssshsdk.....",
  ".....kdswesssswesdk.....",
  ".....kssssssssssssk.....",
  ".....kssssssdsssssk.....",
  ".....kssssssssssssk.....",
  "......kssssssssssk......",
  "......ksssmwwmsssk......",
  ".......ksssmmsssk.......",
  "........kddddddk........",
  ".........kssssk.........",
  ".....kkkkkwsswkkkkk.....",
  "....knnnnnwwwwnnnnnk....",
  "...knnnnnbwwwwbnnnnnk...",
  "...knnnnnnbwwbnnnnnnk...",
  "...knnnnnnnbbnnnnnnnk...",
];

/** The nav's cut, 16 x 16, drawn for 32 px. */
export const PORTRAIT_SMALL: readonly string[] = [
  "................",
  "......k..k......",
  ".....khkkhk.....",
  "....khhhhhhk....",
  "...khhhhhhhhk...",
  "...khhhshhhhk...",
  "...ksssssshsk...",
  "...kswesswesk...",
  "...kssssdsssk...",
  "...kssmwwmssk...",
  "....kssmmssk....",
  ".....kddddk.....",
  "......kssk......",
  "...kkkkwwkkkk...",
  "..knnnbwwbnnnk..",
  ".knnnnnbbnnnnnk.",
];

/** A trait: cells painted over the 24 x 24 drawing (spaces keep the cell). */
export interface PortraitTrait {
  readonly id: string;
  readonly label: string;
  readonly patches: readonly (readonly [
    row: number,
    col: number,
    cells: string,
  ])[];
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
  },
  {
    id: "earring",
    label: "Gold earring",
    patches: [
      [12, 3, "ky"],
      [13, 3, "ky"],
    ],
  },
  {
    id: "pin",
    label: "Lapel pin",
    patches: [
      [20, 7, "ya"],
      [21, 7, "aa"],
    ],
  },
];

/** The drawing with a trait painted on. */
export function withTrait(
  rows: readonly string[],
  trait: PortraitTrait | undefined,
): string[] {
  const grid = rows.map((row) => [...row]);
  for (const [row, col, cells] of trait?.patches ?? []) {
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

/** One square of the drawing: its place, its colour key and its print rank. */
export interface PortraitCell {
  readonly x: number;
  readonly y: number;
  readonly key: string;
  /** The 4 x 4 matrix's rank, 0 to 15: the order it prints in. */
  readonly rank: number;
}

/** Every cell, background included, in reading order. */
export function portraitCells(rows: readonly string[]): PortraitCell[] {
  return rows.flatMap((row, y) =>
    [...row].map((key, x) => ({ x, y, key, rank: bayerRank(x, y) })),
  );
}

/**
 * The drawing as a standalone SVG (the favicon, the PNG icons): one path per
 * colour, crisp edges, a rounded tile when `radius` is set.
 */
export function portraitSvg(
  rows: readonly string[],
  { radius = 0, background = PORTRAIT_BACKGROUND } = {},
): string {
  const size = rows.length;
  const paths = new Map<string, string[]>();
  portraitCells(rows).forEach(({ x, y, key }) => {
    if (key === ".") return;
    const list = paths.get(key) ?? [];
    list.push(`M${x} ${y}h1v1h-1z`);
    paths.set(key, list);
  });
  const shapes = [...paths]
    .map(
      ([key, cells]) =>
        `<path fill="${PORTRAIT_COLOURS[key as keyof typeof PORTRAIT_COLOURS]}" d="${cells.join("")}"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><title>Kunanon Jarat</title><rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/>${shapes}</svg>`;
}

/** A colour key's RGB, the background's for ".". */
function rgb(key: string): [number, number, number] {
  const hex =
    key === "."
      ? PORTRAIT_BACKGROUND
      : PORTRAIT_COLOURS[key as keyof typeof PORTRAIT_COLOURS];
  return [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/**
 * The drawing as a Windows icon (public/favicon.ico): one 32-bit bitmap per
 * scale, square, opaque. Kept beside the drawing so the file never drifts from
 * it (a test compares them).
 */
export function portraitIco(
  rows: readonly string[],
  scales: readonly number[],
): Uint8Array {
  const images = scales.map((scale) => {
    const side = rows.length * scale;
    const maskRow = ((side + 31) >> 5) << 2;
    const bytes = new Uint8Array(40 + side * side * 4 + maskRow * side);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 40, true); // BITMAPINFOHEADER
    view.setInt32(4, side, true);
    view.setInt32(8, side * 2, true); // the colours, then the mask
    view.setUint16(12, 1, true);
    view.setUint16(14, 32, true);
    view.setUint32(20, side * side * 4 + maskRow * side, true);
    for (let y = 0; y < side; y += 1) {
      const row = rows[Math.floor((side - 1 - y) / scale)]!; // bottom-up
      for (let x = 0; x < side; x += 1) {
        const [r, g, b] = rgb(row[Math.floor(x / scale)]!);
        const at = 40 + (y * side + x) * 4;
        bytes.set([b, g, r, 255], at);
      }
    }
    return { side, bytes };
  });
  const head = 6 + 16 * images.length;
  const total = images.reduce((sum, image) => sum + image.bytes.length, head);
  const ico = new Uint8Array(total);
  const view = new DataView(ico.buffer);
  view.setUint16(2, 1, true); // an icon
  view.setUint16(4, images.length, true);
  let offset = head;
  images.forEach(({ side, bytes }, at) => {
    const entry = 6 + at * 16;
    ico[entry] = side % 256;
    ico[entry + 1] = side % 256;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, bytes.length, true);
    view.setUint32(entry + 12, offset, true);
    ico.set(bytes, offset);
    offset += bytes.length;
  });
  return ico;
}
