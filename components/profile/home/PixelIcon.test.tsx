import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  glyphCells,
  PIXEL_LETTERS,
  PixelBadge,
  PixelFile,
  pixelPath,
} from "@/components/profile/home/PixelIcon";
import { stackItems } from "@/lib/content/stack";

/*
 * The orbit's pixel tiles (profile redesign Phase 4; umbrella input R18, its
 * default): our own 5 x 7 letters for every /stack badge, drawn as one path
 * of whole cells, decorative, coloured by tokens only.
 */
describe("pixel letters", () => {
  it("draw every letter a /stack badge uses", () => {
    for (const { name, badge } of stackItems)
      for (const letter of badge)
        expect(PIXEL_LETTERS[letter], `${name}: ${letter}`).toBeDefined();
  });

  it("are 5 cells wide and 7 tall", () => {
    for (const [letter, rows] of Object.entries(PIXEL_LETTERS)) {
      expect(rows, letter).toHaveLength(7);
      for (const row of rows) expect(row, letter).toMatch(/^[01]{5}$/);
    }
  });

  it("centre two letters on the 24-cell grid, one cell apart", () => {
    const cells = glyphCells("TS");
    const xs = cells.map(([x]) => x);
    expect(Math.min(...xs)).toBe(6);
    expect(Math.max(...xs)).toBe(16);
    expect(cells.some(([x]) => x === 11)).toBe(false);
  });
});

describe("pixelPath", () => {
  it("merges each row's neighbouring cells into one rectangle", () => {
    expect(
      pixelPath([
        [1, 0],
        [2, 0],
        [4, 0],
        [0, 1],
      ]),
    ).toBe("M1 0h2v1h-2zM4 0h1v1h-1zM0 1h1v1h-1z");
  });
});

describe("PixelBadge and PixelFile", () => {
  it("are decorative SVGs coloured by a tone class, with no raw colour", () => {
    for (const html of [
      renderToString(<PixelBadge badge="TS" tone="violet" />),
      renderToString(<PixelFile tone="tint" />),
    ]) {
      expect(html).toMatch(/^<svg[^>]*aria-hidden="true"/);
      expect(html).toContain('focusable="false"');
      expect(html).toMatch(/class="pf-px pf-px--(violet|tint)"/);
      expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|fill="/i);
    }
  });
});
