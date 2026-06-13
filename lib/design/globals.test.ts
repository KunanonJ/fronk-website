import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
const layoutTsx = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

/**
 * Contract for the terminal-HUD foundation (Phase 1). These assert the design
 * INTENT of the token layer, not pixel values — the look may be tuned, but the
 * shell must stay: pure-black dark canvas + paper light canvas, hairline rgba
 * borders (not solid 2px ink), flat (no hard offset shadow), monospace
 * instrument + weight-contrast sans (no Syne), with the window-frame,
 * mono-label, and ghost-number motifs available.
 */
describe("terminal-HUD foundation", () => {
  it("uses a pure-black dark canvas and a non-black light canvas", () => {
    expect(globalsCss).toMatch(/\.dark\s*\{[\s\S]*?--bg:\s*#000(000)?\b/i);
    // Light root must NOT be pure black.
    const rootBlock = globalsCss.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(rootBlock).toMatch(/--bg:/);
    expect(rootBlock).not.toMatch(/--bg:\s*#000(000)?\b/i);
  });

  it("draws borders as hairline rgba lines, not solid 2px ink", () => {
    // Both themes express --border as a translucent hairline.
    const rootBlock = globalsCss.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? "";
    const darkBlock = globalsCss.match(/\.dark\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(rootBlock).toMatch(/--border:\s*(rgba|color-mix|oklch)/i);
    expect(darkBlock).toMatch(/--border:\s*(rgba|color-mix|oklch)/i);
  });

  it("is flat — no hard offset drop-shadow token", () => {
    expect(globalsCss).not.toMatch(/--shadow-hard:\s*\d+px\s+\d+px/);
  });

  it("wires monospace instrument + sans, and drops the Syne display face", () => {
    expect(globalsCss).toMatch(/--font-mono:/);
    expect(globalsCss).toMatch(/--font-sans:/);
    expect(layoutTsx).not.toContain("Syne");
    expect(layoutTsx).not.toContain("--font-syne");
  });

  it("provides the HUD motif utilities (frame, mono label, ghost number)", () => {
    expect(globalsCss).toContain("@utility frame-hud");
    expect(globalsCss).toContain("@utility label-mono");
    expect(globalsCss).toContain("@utility ghost-number");
  });

  it("preserves the print palette and reduced-motion guard", () => {
    expect(globalsCss).toMatch(/@media print/);
    expect(globalsCss).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
