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
 * Contract for landing-cutover public shell (supersedes FogLAMP Phase 0).
 */
describe("landing-cutover foundation", () => {
  it("exposes landing primary cream token", () => {
    expect(globalsCss).toMatch(/--color-primary:\s*#dedbc8\b/i);
  });

  it("defines hero noise-overlay utility for landing", () => {
    expect(globalsCss).toMatch(/\.noise-overlay\s*\{/);
  });

  it("wires Almarai + Instrument Serif on the landing layout", () => {
    expect(landingLayout).toContain("Almarai");
    expect(landingLayout).toContain("Instrument_Serif");
    expect(landingLayout).toContain("landing-root");
  });

  it("keeps Hanken available on root for system pages", () => {
    expect(layoutTsx).toContain("Hanken_Grotesk");
    expect(layoutTsx).toContain("--font-hanken");
    expect(layoutTsx).not.toContain("Syne");
    expect(layoutTsx).not.toMatch(/\bInter\b/);
  });

  it("forces dark-only public theme with black themeColor", () => {
    expect(layoutTsx).toContain('forcedTheme="dark"');
    expect(layoutTsx).toMatch(/themeColor:\s*"#000000"/);
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
