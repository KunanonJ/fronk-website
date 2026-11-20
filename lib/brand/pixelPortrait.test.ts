import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PORTRAIT,
  PORTRAIT_COLOURS,
  PORTRAIT_SMALL,
  portraitCells,
  portraitIco,
  portraitSvg,
} from "@/lib/brand/pixelPortrait";
import {
  PORTRAIT_TRAITS,
  goldEdition,
  withTrait,
  wornPortrait,
} from "@/lib/brand/portraitTraits";

/*
 * The pixel portrait: square grids in known colours, traits that stay inside
 * both drawings, and the committed icons drawn from it. Run with
 * UPDATE_ICONS=1 to rewrite public/icon.svg and public/favicon.ico after
 * changing the art.
 */

/** The favicon: the nav's 16 x 16 cut on a rounded tile, as /icon draws it. */
const ICON_SVG = portraitSvg(PORTRAIT_SMALL, { radius: 3.5 });
const FAVICON = portraitIco(PORTRAIT_SMALL, [1, 2, 3]);

describe("the pixel portrait", () => {
  it("is square, 24 and 16 cells, in the drawing's colours", () => {
    for (const [rows, size] of [
      [PORTRAIT, 24],
      [PORTRAIT_SMALL, 16],
    ] as const) {
      expect(rows).toHaveLength(size);
      for (const row of rows) {
        expect(row).toHaveLength(size);
        for (const key of row) {
          expect(key === "." || key in PORTRAIT_COLOURS, key).toBe(true);
        }
      }
    }
  });

  it("puts every cell in one of the matrix's 16 print ranks", () => {
    const cells = portraitCells(PORTRAIT);
    expect(cells).toHaveLength(24 * 24);
    expect(new Set(cells.map((cell) => cell.rank)).size).toBe(16);
  });

  it("paints each trait inside the drawing and changes it", () => {
    expect(PORTRAIT_TRAITS).toHaveLength(6);
    expect(new Set(PORTRAIT_TRAITS.map((t) => t.id)).size).toBe(6);
    for (const trait of PORTRAIT_TRAITS) {
      for (const [row, col, cells] of trait.patches) {
        expect(row, trait.id).toBeLessThan(24);
        expect(col + cells.length, trait.id).toBeLessThanOrEqual(24);
      }
      const worn = withTrait(PORTRAIT, trait);
      expect(worn).toHaveLength(24);
      expect(
        worn.every((row) => row.length === 24),
        trait.id,
      ).toBe(true);
      expect(worn, trait.id).not.toEqual(PORTRAIT);
    }
    expect(withTrait(PORTRAIT, undefined)).toEqual(PORTRAIT);
  });

  it("paints each trait inside the nav's 16 x 16 cut too, in its colours", () => {
    for (const trait of PORTRAIT_TRAITS) {
      expect(trait.smallPatches.length, trait.id).toBeGreaterThan(0);
      for (const [row, col, cells] of trait.smallPatches) {
        expect(row, trait.id).toBeGreaterThanOrEqual(0);
        expect(row, trait.id).toBeLessThan(16);
        expect(col, trait.id).toBeGreaterThanOrEqual(0);
        expect(col + cells.length, trait.id).toBeLessThanOrEqual(16);
        for (const key of cells.replaceAll(" ", "")) {
          expect(key in PORTRAIT_COLOURS, `${trait.id}: ${key}`).toBe(true);
        }
      }
      const worn = withTrait(PORTRAIT_SMALL, trait);
      expect(worn).toHaveLength(16);
      expect(
        worn.every((row) => row.length === 16),
        trait.id,
      ).toBe(true);
      expect(worn, trait.id).not.toEqual(PORTRAIT_SMALL);
    }
    expect(withTrait(PORTRAIT_SMALL, undefined)).toEqual(PORTRAIT_SMALL);
  });

  it("dresses a drawing as the visitor has it: their trait, then gold", () => {
    expect(wornPortrait(PORTRAIT_SMALL, null, 0)).toEqual(PORTRAIT_SMALL);
    expect(wornPortrait(PORTRAIT_SMALL, "unknown", 2)).toEqual(PORTRAIT_SMALL);
    const shades = PORTRAIT_TRAITS[0]!;
    expect(wornPortrait(PORTRAIT_SMALL, "shades", 1)).toEqual(
      withTrait(PORTRAIT_SMALL, shades),
    );
    expect(wornPortrait(PORTRAIT, "shades", 6)).toEqual(
      goldEdition(withTrait(PORTRAIT, shades)),
    );
  });

  it("turns the outline gold for the gold edition, and nothing else", () => {
    const gold = goldEdition(PORTRAIT);
    expect(gold.join("")).not.toContain("k");
    expect(gold.join("").replaceAll("y", "k")).toBe(
      PORTRAIT.join("").replaceAll("y", "k"),
    );
  });

  it("draws an SVG with one path per colour", () => {
    const svg = portraitSvg(PORTRAIT_SMALL);
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(svg).toContain('viewBox="0 0 16 16"');
    const colours = new Set(PORTRAIT_SMALL.join("").replaceAll(".", ""));
    expect(svg.match(/<path /g)).toHaveLength(colours.size);
  });

  it("builds an icon file with a bitmap per scale", () => {
    const view = new DataView(FAVICON.buffer);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(3);
    expect([6, 22, 38].map((at) => FAVICON[at])).toEqual([16, 32, 48]);
  });
});

describe("the committed icons are drawn from the portrait", () => {
  const svgPath = join(process.cwd(), "public/icon.svg");
  const icoPath = join(process.cwd(), "public/favicon.ico");
  if (process.env.UPDATE_ICONS === "1") {
    writeFileSync(svgPath, `${ICON_SVG}\n`);
    writeFileSync(icoPath, FAVICON);
  }

  it("public/icon.svg", () => {
    expect(readFileSync(svgPath, "utf8")).toBe(`${ICON_SVG}\n`);
  });

  it("public/favicon.ico", () => {
    expect(new Uint8Array(readFileSync(icoPath))).toEqual(FAVICON);
  });
});
