import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PixelNumber,
  pixelFigure,
} from "@/components/profile/home/PixelNumber";

/*
 * Pixel digits (design spec 8.5, 12 item 30): drawn for the eye, and the same
 * figure as real text for screen readers and search.
 */
describe("pixelFigure", () => {
  it("lays glyphs a column apart: 5 wide digits, a 2 wide comma", () => {
    expect(pixelFigure("1").width).toBe(5);
    expect(pixelFigure("50+").width).toBe(5 + 1 + 5 + 1 + 5);
    expect(pixelFigure("1,000").width).toBe(5 + 1 + 2 + 1 + 5 + 1 + 5 + 1 + 5);
  });

  it("draws one unit square per lit pixel, inside its 7 rows", () => {
    const { path } = pixelFigure("8");
    const squares = path.match(/M\d+ \d+h1v1h-1z/g) ?? [];
    // The 8 is 3 + 2 + 2 + 3 + 2 + 2 + 3 lit cells across its 7 rows.
    expect(squares).toHaveLength(17);
    for (const square of squares) {
      const [, x, y] = square.match(/M(\d+) (\d+)/)!;
      expect(Number(x)).toBeLessThan(5);
      expect(Number(y)).toBeLessThan(7);
    }
  });

  it("refuses a character it has no glyph for, rather than dropping it", () => {
    expect(() => pixelFigure("THB 1")).toThrow(/No pixel glyph/);
  });
});

describe("PixelNumber", () => {
  const html = renderToString(<PixelNumber value="1,000" />);

  it("keeps the figure as text and hides the drawing from assistive technology", () => {
    expect(html).toContain('<span class="sr-only">1,000</span>');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toMatch(/viewBox="0 0 26 7"/);
  });
});
