import { describe, expect, it } from "vitest";
import { loadOgFonts } from "./fonts";

describe("loadOgFonts", () => {
  it("decodes the two bundled Geist faces once and reuses them", () => {
    const fonts = loadOgFonts();
    expect(fonts.map((f) => [f.name, f.weight])).toEqual([
      ["Geist", 400],
      ["Geist", 800],
    ]);
    for (const font of fonts) {
      // TrueType files start with 0x00010000.
      expect(new DataView(font.data).getUint32(0)).toBe(0x00010000);
    }
    expect(loadOgFonts()).toBe(fonts);
  });
});
