import { describe, expect, it } from "vitest";
import { BROWSER_ART, PHONE_ART } from "@/components/profile/site/footerArt";
import { pixelCells } from "@/components/profile/site/PixelArt";

/*
 * The footer's pixel drawings (design spec 7.7). A drawing is a grid: every row
 * is the same length, and every character names a tone.
 */
describe("footer drawings", () => {
  it.each([
    ["browser", BROWSER_ART, 16],
    ["phone", PHONE_ART, 10],
  ] as const)(
    "every row of the %s drawing has the same width",
    (_name, art, width) => {
      art.forEach((row, y) => {
        expect(row, `row ${y}`).toHaveLength(width);
      });
    },
  );

  it.each([
    ["browser", BROWSER_ART],
    ["phone", PHONE_ART],
  ] as const)(
    "the %s drawing uses only characters with a tone",
    (_name, art) => {
      const drawn = pixelCells(art).length;
      const filled = art.join("").replace(/[^kwtgac]/g, "").length;
      expect(drawn).toBe(filled);
    },
  );
});
