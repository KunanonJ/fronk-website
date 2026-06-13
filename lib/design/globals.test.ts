import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(
  join(process.cwd(), "app/globals.css"),
  "utf8",
);

const layoutTsx = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

describe("Phase 0 brutalist foundation", () => {
  it("defines core surface and hard-shadow tokens in globals.css", () => {
    expect(globalsCss).toMatch(/--surface:/);
    expect(globalsCss).toMatch(/--shadow-hard:/);
    expect(globalsCss).toContain("--color-surface: var(--surface)");
  });

  it("maps display font in theme and loads Syne in layout", () => {
    expect(globalsCss).toMatch(/--font-display:/);
    expect(layoutTsx).toContain("Syne");
    expect(layoutTsx).toContain("--font-syne");
  });

  it("exports brutalist utility classes", () => {
    expect(globalsCss).toContain("@utility border-brutal");
    expect(globalsCss).toContain("@utility shadow-brutal");
    expect(globalsCss).toContain("@utility sticker");
    expect(globalsCss).toContain("@utility card-brutal");
  });

  it("uses high-contrast ink borders in light and dark roots", () => {
    expect(globalsCss).toMatch(/:root\s*\{[\s\S]*--border:\s*#0a0a0a/);
    expect(globalsCss).toMatch(/\.dark\s*\{[\s\S]*--border:\s*#f5f5f0/);
  });
});
