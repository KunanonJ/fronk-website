import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";

/**
 * Ratchet on raw 6-digit hex colours in components and pages
 * (visual-redesign): colour belongs in src/styles/globals.css tokens. Lower MAX as
 * pages are redesigned; the target is 0. Never raise it. The bento primitives
 * (phase 7a), the Bangkok scene included, are scanned too.
 *
 * Allowlisted: renderers that can't read CSS variables (icons, OG images) and
 * app/layout.tsx, whose viewport themeColor metadata must be a literal.
 */
const MAX_RAW_HEX = 0;
const ALLOW = [
  /^app\/icon\.tsx$/,
  /^app\/apple-icon\.tsx$/,
  /opengraph-image\.tsx$/,
  /^app\/layout\.tsx$/,
];

describe("raw hex ratchet", () => {
  const files = sourceFiles([
    "components/landing",
    "components/bento",
    "src/routes",
  ]).filter((f) => !ALLOW.some((re) => re.test(f)));
  const counts = files
    .map((f) => [f, read(f).match(/#[0-9a-fA-F]{6}\b/g)?.length ?? 0] as const)
    .filter(([, n]) => n > 0);
  const total = counts.reduce((sum, [, n]) => sum + n, 0);

  it(`has at most ${MAX_RAW_HEX} raw hex colours`, () => {
    expect(
      total,
      counts.map(([f, n]) => `${n} ${f}`).join("\n"),
    ).toBeLessThanOrEqual(MAX_RAW_HEX);
  });

  it("design-system primitives use tokens only", () => {
    for (const f of ["PixelGrid", "Button", "Container"]) {
      expect(read(`components/ui/${f}.tsx`), f).not.toMatch(
        /#[0-9a-fA-F]{6}\b/,
      );
    }
  });
});
