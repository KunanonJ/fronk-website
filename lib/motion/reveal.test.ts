import { describe, expect, it } from "vitest";
import { shouldStartHidden } from "./reveal";

describe("shouldStartHidden > only hides content comfortably below the fold", () => {
  it("hides an element well below the viewport (will reveal on scroll)", () => {
    expect(shouldStartHidden(1000, 800)).toBe(true);
  });

  it("keeps an above-the-fold element visible (no flash-of-hidden-content)", () => {
    expect(shouldStartHidden(100, 800)).toBe(false);
  });

  it("keeps an element just inside the fold visible", () => {
    // top 700 < 0.9 * 800 (720) → already on screen, stay visible
    expect(shouldStartHidden(700, 800)).toBe(false);
  });

  it("treats the fold boundary itself as visible", () => {
    expect(shouldStartHidden(720, 800)).toBe(false);
  });
});
