import { describe, expect, it } from "vitest";
import { isNamedMeta, rootHead } from "@/lib/seo/metadataToHead";
import { rootViewport } from "@/lib/seo/rootMetadata";
import {
  THEME_COLOR_SCRIPT,
  THEME_COLORS,
  themeColorFor,
} from "@/lib/seo/themeColor";

/*
 * The browser's toolbar colour follows the site's theme, not the OS's
 * (UX hunt 22-11-26, U08): one meta, no `media`, light from the server,
 * dark before the first paint when the stored theme is dark.
 */

/**
 * Runs the head script against a page whose one theme-color meta holds the
 * server's colour, with `stored` as localStorage's "theme" (an Error: the
 * storage throws). Returns the meta's colour afterwards.
 */
function runScript(stored: string | null | Error): string {
  let content: string = THEME_COLORS.light;
  const meta = {
    setAttribute(name: string, value: string) {
      if (name === "content") content = value;
    },
  };
  const document = {
    querySelector: (selector: string) =>
      selector === 'meta[name="theme-color"]' ? meta : null,
  };
  const localStorage = {
    getItem(key: string) {
      if (stored instanceof Error) throw stored;
      return key === "theme" ? stored : null;
    },
  };
  new Function("localStorage", "document", THEME_COLOR_SCRIPT)(
    localStorage,
    document,
  );
  return content;
}

describe("the toolbar colour (theme-color)", () => {
  it("takes each theme's --theme-color (contrast.test.ts pins the CSS)", () => {
    expect(THEME_COLORS).toEqual({ light: "#f7f3ff", dark: "#0f0c18" });
  });

  it("is one light meta with no media in every page's head", () => {
    const metas = rootHead(rootViewport).meta.filter((m) =>
      isNamedMeta(m, "theme-color"),
    );
    expect(metas).toEqual([{ name: "theme-color", content: "#f7f3ff" }]);
  });

  it("names the dark colour for the dark theme only, as next-themes' class does", () => {
    expect(themeColorFor("dark")).toBe(THEME_COLORS.dark);
    expect(themeColorFor("light")).toBe(THEME_COLORS.light);
    // A stored "system" puts no `dark` class on <html> when the system
    // theme is off: the page is light.
    expect(themeColorFor("system")).toBe(THEME_COLORS.light);
    expect(themeColorFor(undefined)).toBe(THEME_COLORS.light);
  });

  it("the head script makes it dark before the first paint when the stored theme is dark", () => {
    expect(runScript("dark")).toBe(THEME_COLORS.dark);
  });

  it("the head script leaves it light for a light, missing or other stored theme", () => {
    expect(runScript("light")).toBe(THEME_COLORS.light);
    expect(runScript(null)).toBe(THEME_COLORS.light);
    expect(runScript("system")).toBe(THEME_COLORS.light);
  });

  it("the head script leaves it light, quietly, when storage cannot be read", () => {
    expect(runScript(new DOMException("denied", "SecurityError"))).toBe(
      THEME_COLORS.light,
    );
  });

  it("the head script is written out with the colour, no interpolation", () => {
    // The root route keeps the string out of the client bundle only while
    // it is a plain literal.
    expect(THEME_COLOR_SCRIPT).toContain(`"${THEME_COLORS.dark}"`);
    expect(THEME_COLOR_SCRIPT).not.toContain("${");
  });
});
