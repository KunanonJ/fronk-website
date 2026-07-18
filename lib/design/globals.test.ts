import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
const layoutTsx = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");
const siteShell = readFileSync(
  join(process.cwd(), "components/layout/SiteShell.tsx"),
  "utf8",
);

const soehneDir = join(process.cwd(), "public/fonts/soehne");
const hasSoehne = existsSync(soehneDir);

/**
 * Contract for FogLAMP-mood portfolio foundation (Phase 0).
 * Near-black canvas, Inter until Söhne woff2 exist, dark-only public site,
 * no Lenis on public shell.
 */
describe("portfolio foundation (FogLAMP mood Phase 0)", () => {
  it("uses a near-black dark canvas", () => {
    const darkBlock = globalsCss.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(darkBlock).toMatch(/--bg:\s*#0a0a0a\b/i);
  });

  it("raises dark grain opacity for atmosphere", () => {
    const darkBlock = globalsCss.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(darkBlock).toMatch(/--grain-opacity:\s*0\.0[5-9]/);
  });

  it("exposes a hero-field token aligned to the near-black plane", () => {
    expect(globalsCss).toMatch(/--hero-field:/);
    const darkBlock = globalsCss.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(darkBlock).toMatch(/--hero-field:\s*#0a0a0a\b/i);
  });

  it("draws borders as hairline rgba lines", () => {
    const darkBlock = globalsCss.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(darkBlock).toMatch(/--border:\s*(rgba|color-mix|oklch)/i);
  });

  it("is flat — no hard offset drop-shadow token", () => {
    expect(globalsCss).not.toMatch(/--shadow-hard:\s*\d+px\s+\d+px/);
  });

  it("wires Hanken Grotesk as Söhne stand-in until licensed woff2 exist", () => {
    expect(globalsCss).toMatch(/--font-sans:/);
    expect(globalsCss).toMatch(/--font-display:/);
    if (hasSoehne) {
      expect(layoutTsx).toMatch(/soehne|Söhne|Soehne/i);
    } else {
      expect(layoutTsx).toContain("Hanken_Grotesk");
      expect(layoutTsx).toContain("--font-hanken");
      expect(layoutTsx).toMatch(/Söhne|soehne/i);
      expect(globalsCss).toMatch(/--font-sans:\s*var\(--font-hanken\)/);
      expect(globalsCss).toMatch(/--font-display:\s*var\(--font-hanken\)/);
    }
    expect(layoutTsx).not.toContain("Syne");
    expect(layoutTsx).not.toMatch(/\bInter\b/);
  });

  it("forces dark-only public theme with matching themeColor", () => {
    expect(layoutTsx).toContain('forcedTheme="dark"');
    expect(layoutTsx).toMatch(/themeColor:\s*"#0a0a0a"/);
  });

  it("does not mount Lenis SmoothScrollProvider on the public shell", () => {
    expect(siteShell).not.toContain("SmoothScrollProvider");
    expect(globalsCss).not.toMatch(/@import\s+["']lenis/);
  });

  it("does not add new HUD chrome utilities beyond deprecated set", () => {
    expect(globalsCss).toContain("@utility frame-hud");
  });

  it("preserves the print palette and reduced-motion guard", () => {
    expect(globalsCss).toMatch(/@media print/);
    expect(globalsCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
