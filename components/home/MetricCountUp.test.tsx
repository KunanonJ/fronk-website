import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetricCountUp, parseMetric, formatCount } from "./MetricCountUp";

// Control reduced-motion per test. Defaults to reduced (no animation) so the
// component renders its static source-of-truth value deterministically.
vi.mock("@/lib/hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => true),
}));

describe("parseMetric / formatCount > round-trip the figure exactly", () => {
  it("parses a grouped, suffixed figure and rebuilds it identically", () => {
    const parsed = parseMetric("1,000+");
    expect(parsed).toEqual({ prefix: "", target: 1000, suffix: "+", grouped: true });
    // The animation's final frame must reproduce the input string verbatim.
    expect(formatCount(parsed!.target, parsed!)).toBe("1,000+");
  });

  it("parses a percentage", () => {
    const parsed = parseMetric("30%");
    expect(parsed).toEqual({ prefix: "", target: 30, suffix: "%", grouped: false });
    expect(formatCount(parsed!.target, parsed!)).toBe("30%");
  });

  it("returns null for a non-numeric value", () => {
    expect(parseMetric("Acquired")).toBeNull();
  });
});

describe("MetricCountUp > honours reduced motion and SSR", () => {
  it("renders the final value immediately (reduced motion / first paint)", () => {
    render(<MetricCountUp value="1,000+" />);
    // No zero-flash: the real number is on screen from the first render.
    expect(screen.getByText("1,000+")).toBeInTheDocument();
  });

  it("renders a non-numeric value verbatim with no animation", () => {
    render(<MetricCountUp value="Acquired" />);
    expect(screen.getByText("Acquired")).toBeInTheDocument();
  });

  it("passes through its className", () => {
    render(<MetricCountUp value="220+" className="tabular-nums" />);
    expect(screen.getByText("220+").className).toContain("tabular-nums");
  });
});
