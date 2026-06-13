import { describe, expect, it } from "vitest";
import {
  formatCoord,
  formatProgress,
  formatSeconds,
  scrollProgress,
} from "./telemetry";

describe("scrollProgress > given a scrollable page > returns 0..1 fraction", () => {
  it("is 0 at the top", () => {
    expect(scrollProgress(0, 3000, 900)).toBe(0);
  });

  it("is 1 at the bottom", () => {
    expect(scrollProgress(2100, 3000, 900)).toBe(1);
  });

  it("is the midpoint fraction halfway down", () => {
    expect(scrollProgress(1050, 3000, 900)).toBeCloseTo(0.5, 5);
  });
});

describe("scrollProgress > given an unscrollable page > returns 0", () => {
  it("returns 0 when content fits the viewport (no division by zero)", () => {
    expect(scrollProgress(0, 800, 900)).toBe(0);
    expect(scrollProgress(50, 800, 900)).toBe(0);
  });
});

describe("scrollProgress > clamps out-of-range scroll (overscroll)", () => {
  it("never exceeds 1 or drops below 0", () => {
    expect(scrollProgress(99999, 3000, 900)).toBe(1);
    expect(scrollProgress(-50, 3000, 900)).toBe(0);
  });
});

describe("formatters > produce stable terminal-style readouts", () => {
  it("formatProgress pads to three decimals", () => {
    expect(formatProgress(0)).toBe("0.000");
    expect(formatProgress(0.5)).toBe("0.500");
    expect(formatProgress(1)).toBe("1.000");
  });

  it("formatSeconds shows two decimals", () => {
    expect(formatSeconds(0)).toBe("0.00");
    expect(formatSeconds(18.347)).toBe("18.35");
  });

  it("formatCoord rounds to an integer", () => {
    expect(formatCoord(719.6)).toBe("720");
    expect(formatCoord(0)).toBe("0");
  });
});
