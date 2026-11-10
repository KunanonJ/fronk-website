import { describe, expect, it } from "vitest";
import { META_DESCRIPTION_MAX, clampDescription } from "./metaDescription";

describe("clampDescription", () => {
  it("leaves short descriptions alone", () => {
    expect(clampDescription("A short line.")).toBe("A short line.");
  });

  it("cuts at a late sentence end when there is one", () => {
    const text = `${"a".repeat(120)}. ${"b".repeat(80)}`;
    expect(clampDescription(text)).toBe(`${"a".repeat(120)}.`);
  });

  it("otherwise cuts at a word boundary with an ellipsis, within the limit", () => {
    const text = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const out = clampDescription(text);
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(out.endsWith("…")).toBe(true);
    expect(text.startsWith(out.slice(0, -1))).toBe(true);
  });
});
