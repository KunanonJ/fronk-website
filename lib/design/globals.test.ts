import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
const layoutTsx = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
const landingLayout = readFileSync(
  join(process.cwd(), "app/(landing)/layout.tsx"),
  "utf8",
);

/**
 * Foundation contract for the visual redesign (Phase 0, 09-11-26): the owner's
 * palette, light by default, Geist + Geist Mono, and legacy aliases that keep
 * un-migrated pages on the new palette. Supersedes the landing-cutover look.
 */
describe("visual-redesign foundation", () => {
  it("defines the owner's palette once", () => {
    for (const [name, hex] of [
      ["signal", "#2b3bff"],
      ["glaze", "#e8ebff"],
      ["paper", "#ffffff"],
      ["ink", "#0b0d17"],
      ["clay", "#ffe3d6"],
      ["ember", "#ff5a1f"],
    ]) {
      expect(globalsCss).toMatch(new RegExp(`--palette-${name}:\\s*${hex}`, "i"));
    }
  });

  it("maps role tokens into Tailwind and keeps the landing shell on them", () => {
    for (const role of ["page", "ink", "ink-2", "action", "link", "focus", "ember", "hairline"]) {
      expect(globalsCss).toMatch(new RegExp(`--color-${role}:\\s*var\\(--`));
    }
    expect(globalsCss).toMatch(/--landing-canvas:\s*var\(--page\)/);
    expect(globalsCss).toMatch(/--landing-ink:\s*var\(--ink\)/);
    expect(globalsCss).toMatch(/--color-primary:\s*var\(--landing-ink\)/);
  });

  it("uses Geist, Geist Mono and Noto Sans Thai, and drops the retired fonts", () => {
    expect(layoutTsx).toContain("Geist");
    expect(layoutTsx).toContain("Geist_Mono");
    expect(layoutTsx).toContain("Noto_Sans_Thai");
    const fontImports = (src: string) =>
      [...src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"next\/font\/google"/g)]
        .map((m) => m[1]!)
        .join(",");
    for (const retired of ["Hanken_Grotesk", "Instrument_Serif", "Space_Mono", "Almarai", "Inter"]) {
      expect(fontImports(layoutTsx)).not.toMatch(new RegExp(`\\b${retired}\\b`));
      expect(fontImports(landingLayout)).not.toMatch(new RegExp(`\\b${retired}\\b`));
    }
    // Old inline font names still resolve, to the new families.
    expect(globalsCss).toMatch(/--font-instrument-serif:\s*var\(--font-geist-sans\)/);
    expect(globalsCss).toMatch(/--font-almarai:\s*var\(--font-geist-sans\)/);
  });

  it("defaults to light with the toggle unlocked and palette themeColors", () => {
    expect(layoutTsx).not.toContain("forcedTheme");
    expect(layoutTsx).toContain('defaultTheme="light"');
    expect(layoutTsx).toMatch(/#0b0d17/i);
    expect(layoutTsx).toMatch(/#f5f6fa/i);
  });

  it("keeps the landing shell wrapper and skip link", () => {
    expect(landingLayout).toContain("landing-root");
    expect(landingLayout).toContain('href="#main"');
  });

  it("does not mount FogLAMP SiteShell chrome in root layout", () => {
    expect(layoutTsx).not.toContain("SiteShell");
    expect(layoutTsx).not.toContain("Header");
    expect(layoutTsx).not.toContain("Footer");
  });

  it("does not import Lenis on the public CSS shell", () => {
    expect(globalsCss).not.toMatch(/@import\s+["']lenis/);
  });

  it("preserves the print palette and reduced-motion guard", () => {
    expect(globalsCss).toMatch(/@media print/);
    expect(globalsCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
