import { describe, expect, it } from "vitest";
import { ditherCells } from "@/components/ds/ditherCells";

describe("ditherCells", () => {
  const field = { width: 400, height: 200, cell: 10 } as const;

  it("is deterministic for the same size and seed", () => {
    expect(ditherCells({ ...field, seed: 3 })).toEqual(
      ditherCells({ ...field, seed: 3 }),
    );
  });

  it("varies with the seed", () => {
    expect(ditherCells({ ...field, seed: 1 })).not.toEqual(
      ditherCells({ ...field, seed: 2 }),
    );
  });

  it("thins toward the far edge", () => {
    const cells = ditherCells(field);
    const rows = field.height / field.cell;
    const top = cells.filter((c) => c.y < rows / 4).length;
    const bottom = cells.filter((c) => c.y >= (rows * 3) / 4).length;
    expect(top).toBeGreaterThan(bottom * 4);
  });

  it("follows the fade direction", () => {
    const cols = field.width / field.cell;
    const left = ditherCells({ ...field, fade: "right" }).filter(
      (c) => c.x < cols / 2,
    ).length;
    const right = ditherCells({ ...field, fade: "right" }).filter(
      (c) => c.x >= cols / 2,
    ).length;
    expect(right).toBeGreaterThan(left);
  });

  it("stays inside the field and reports its ramp", () => {
    for (const c of ditherCells(field)) {
      expect(c.x).toBeLessThan(field.width / field.cell);
      expect(c.y).toBeLessThan(field.height / field.cell);
      expect(c.level).toBeGreaterThan(0);
      expect(c.level).toBeLessThanOrEqual(1);
    }
  });

  it("draws nothing for an empty field", () => {
    expect(ditherCells({ width: 0, height: 200 })).toEqual([]);
  });
});
