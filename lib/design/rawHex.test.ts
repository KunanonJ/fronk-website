import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";

/**
 * Ratchet on raw 6-digit hex colours in components, routes and server code:
 * colour belongs in the tokens of src/styles/globals.css. It reached 0 with
 * the profile redesign and stays there. Renderers that cannot read CSS
 * variables (the icons and share images) take their colours from
 * lib/brand/tokens.ts, which mirrors the tokens.
 */
const MAX_RAW_HEX = 0;

describe("raw hex ratchet", () => {
  const files = sourceFiles(["components", "src"]);
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
});
