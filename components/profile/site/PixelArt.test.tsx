import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PixelArt, pixelCells } from "@/components/profile/site/PixelArt";

/*
 * Pixel drawings are code-drawn: one square per filled character, coloured by
 * a token class, decorative and hidden from assistive technology.
 */
describe("pixelCells", () => {
  it("lists each filled character once, in reading order, with its tone", () => {
    expect(pixelCells(["kw.", ".ca"])).toEqual([
      { x: 0, y: 0, tone: "ink" },
      { x: 1, y: 0, tone: "paper" },
      { x: 1, y: 1, tone: "coral" },
      { x: 2, y: 1, tone: "accent" },
    ]);
  });
});

describe("PixelArt", () => {
  it("renders a hidden SVG with one token-classed square per cell", () => {
    const html = renderToString(<PixelArt rows={["kw.", ".tg"]} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('viewBox="0 0 3 2"');
    expect(html.match(/class="pf-px pf-px--/g)).toHaveLength(4);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
