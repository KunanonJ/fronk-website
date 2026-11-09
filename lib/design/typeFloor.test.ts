import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";

/**
 * Ratchet for the 12 px text floor (visual-redesign; ux-audit finding 9).
 * Counts arbitrary text sizes below 12 px. Each phase lowers MAX as it
 * redesigns pages; Phase 6 must reach 0. Never raise it.
 */
const MAX_SUB_12PX = 35;

function sub12(source: string): number {
  let n = 0;
  for (const m of source.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) if (Number(m[1]) < 12) n += 1;
  for (const m of source.matchAll(/text-\[(\d*\.?\d+)rem\]/g)) if (Number(m[1]) < 0.75) n += 1;
  return n;
}

describe("type floor ratchet", () => {
  const counts = sourceFiles(["components", "app"])
    .map((f) => [f, sub12(read(f))] as const)
    .filter(([, n]) => n > 0);
  const total = counts.reduce((sum, [, n]) => sum + n, 0);

  it(`has at most ${MAX_SUB_12PX} text sizes under 12 px`, () => {
    expect(total, counts.map(([f, n]) => `${n} ${f}`).join("\n")).toBeLessThanOrEqual(MAX_SUB_12PX);
  });

  it("new design-system primitives use no sub-12 px text", () => {
    for (const f of ["Chip", "MonoLabel", "Section", "PixelGrid", "Button", "Card"]) {
      expect(sub12(read(`components/ui/${f}.tsx`)), f).toBe(0);
    }
  });
});
