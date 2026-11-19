import { describe, expect, it } from "vitest";
import { loadOgFonts } from "./fonts";

describe("loadOgFonts", () => {
  it("decodes the site's faces once and reuses them", () => {
    const fonts = loadOgFonts();
    expect(fonts.map((f) => [f.name, f.weight, f.style])).toEqual([
      ["Instrument Serif", 400, "normal"],
      ["Instrument Serif", 400, "italic"],
      ["Onest", 400, "normal"],
      ["Onest", 500, "normal"],
    ]);
    for (const font of fonts) {
      // TrueType files start with 0x00010000.
      expect(new DataView(font.data).getUint32(0)).toBe(0x00010000);
    }
    expect(loadOgFonts()).toBe(fonts);
  });
});
