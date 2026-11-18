import { describe, expect, it } from "vitest";
import { aboutCopy } from "@/lib/content/homeWorkAbout";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { getVentureBySlug } from "@/lib/content/ventures";
import { aboutStats, resolveStat } from "@/lib/landing/aboutStats";

/*
 * The stats tile's figures (design spec 8.5, umbrella R8): each read from the
 * place the owner cleared it, never typed, and only counts the pixel digits
 * can draw without dropping a word that belongs to the figure.
 */
describe("aboutStats", () => {
  const stats = aboutStats();

  it("shows at most three figures, as the tile has room for", () => {
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.length).toBeLessThanOrEqual(3);
  });

  it("reads each figure from its cleared source", () => {
    const adoption = getPortfolioProjectBySlug("tbh-intranet")!.outcomes!.find(
      (outcome) => outcome.label === "Adoption",
    )!;
    const metrics = getVentureBySlug("gogocash")!.metrics!;
    const metric = (label: string) =>
      metrics.find((item) => item.label === label)!;
    expect(stats).toEqual([
      {
        figure: adoption.value.split(" ")[0],
        label: "Employees on TBH Intranet",
      },
      {
        figure: metric("Registered users").value,
        label: `${metric("Registered users").label} on GoGoCash`,
      },
      {
        figure: metric("Merchants").value,
        label: `${metric("Merchants").label} on GoGoCash`,
      },
    ]);
    // The outcome's value is the figure and its unit, word for word.
    expect(`${stats[0]!.figure} employees`).toBe(adoption.value);
  });

  it("names every figure's source in the selection, not a value", () => {
    for (const source of aboutCopy.stats.figures)
      expect(JSON.stringify(source)).not.toMatch(/\d/);
  });

  it("refuses a change, a dated total or an unknown source", () => {
    expect(() =>
      resolveStat({ project: "tbh-intranet", outcome: "Build cycles" }),
    ).toThrow(/not a cleared count/);
    expect(() =>
      resolveStat({ venture: "gogocash", metric: "Cashback paid" }),
    ).toThrow(/undated, cleared count/);
    expect(() =>
      resolveStat({ venture: "manut", metric: "Registered users" }),
    ).toThrow();
    expect(() =>
      resolveStat({ project: "nope", outcome: "Adoption" }),
    ).toThrow();
  });
});
