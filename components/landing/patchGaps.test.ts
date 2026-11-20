import { describe, expect, it } from "vitest";
import { GAP_COUNT, pixelGaps } from "@/components/landing/patchGaps";
import { NOT_FOUND_ART } from "@/components/landing/statusArt";
import { pixelCells } from "@/components/profile/site/PixelArt";

/*
 * The 404 you fix (now-building-and-genz Phase 6): the drawing loses the same
 * pixels on every visit, inside the picture, far enough apart that each
 * gap's 24 px target clears the next.
 */
const cells = pixelCells(NOT_FOUND_ART);
const gaps = pixelGaps(cells);
const at = ({ x, y }: { x: number; y: number }) => `${x}.${y}`;

describe("pixelGaps", () => {
  it("takes the same seven pixels every time, in reading order", () => {
    expect(gaps).toHaveLength(GAP_COUNT);
    expect(pixelGaps(pixelCells(NOT_FOUND_ART))).toEqual(gaps);
    expect(gaps.map(at)).toMatchInlineSnapshot(`
      [
        "3.1",
        "19.1",
        "9.3",
        "4.6",
        "11.8",
        "20.8",
        "7.9",
      ]
    `);
    const order = [...gaps].sort((a, b) => a.y - b.y || a.x - b.x);
    expect(gaps).toEqual(order);
  });

  it("takes only pixels with a filled pixel on every side", () => {
    const filled = new Set(cells.map(at));
    for (const { x, y } of gaps) {
      for (const side of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        expect(filled.has(`${side[0]}.${side[1]}`), `${x}.${y}`).toBe(true);
      }
    }
  });

  it("keeps the gaps three cells apart, across or down", () => {
    for (const [i, a] of gaps.entries()) {
      for (const b of gaps.slice(i + 1)) {
        const apart = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        expect(apart, `${at(a)} / ${at(b)}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("keeps each gap's colour", () => {
    for (const gap of gaps) {
      expect(cells).toContainEqual(gap);
    }
  });
});
