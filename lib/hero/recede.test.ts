import { describe, expect, it } from "vitest";
import { heroRecede } from "./recede";

describe("heroRecede > at the top of the page > hero is full and sharp", () => {
  it("returns scale 1, opacity 1, no blur at progress 0", () => {
    const r = heroRecede(0);
    expect(r.scale).toBeCloseTo(1, 5);
    expect(r.opacity).toBeCloseTo(1, 5);
    expect(r.blur).toBeCloseTo(0, 5);
  });
});

describe("heroRecede > after one viewport > hero has receded (matveyan curve)", () => {
  it("approaches scale ~0.887, opacity ~0, blur ~9.4 at progress 1", () => {
    const r = heroRecede(1);
    expect(r.scale).toBeCloseTo(0.887, 2);
    expect(r.opacity).toBeLessThan(0.06);
    expect(r.blur).toBeCloseTo(9.44, 1);
  });

  it("matches the measured midpoints (monotonic recede)", () => {
    // Measured: opacity ~0.53 at p≈0.33, ~0.30 at p≈0.55.
    expect(heroRecede(0.33).opacity).toBeCloseTo(0.53, 1);
    expect(heroRecede(0.55).opacity).toBeCloseTo(0.3, 1);
    // Scale and blur move monotonically toward the receded end.
    expect(heroRecede(0.5).scale).toBeLessThan(heroRecede(0.25).scale);
    expect(heroRecede(0.5).blur).toBeGreaterThan(heroRecede(0.25).blur);
  });
});

describe("heroRecede > clamps out-of-range progress", () => {
  it("treats negative progress as the top", () => {
    expect(heroRecede(-1).scale).toBeCloseTo(1, 5);
    expect(heroRecede(-1).opacity).toBeCloseTo(1, 5);
  });

  it("treats progress beyond 1 as fully receded", () => {
    const beyond = heroRecede(3);
    const edge = heroRecede(1);
    expect(beyond.scale).toBeCloseTo(edge.scale, 5);
    expect(beyond.opacity).toBeCloseTo(edge.opacity, 5);
  });
});
