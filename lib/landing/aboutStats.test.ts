import { describe, expect, it } from "vitest";
import { aboutCopy } from "@/lib/content/homeWorkAbout";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { getVentureBySlug } from "@/lib/content/ventures";
import {
  aboutStats,
  resolveStat,
  statsFootnote,
  type AboutStat,
} from "@/lib/landing/aboutStats";

/*
 * The stats tile's figures (design spec 8.5, umbrella R8): each read from the
 * place the owner cleared it, never typed, and only counts the pixel digits
 * can draw without dropping a word that belongs to the figure. The labels
 * keep their source's own words, and the footnote names the cases the
 * figures come from.
 */
describe("aboutStats", () => {
  const stats = aboutStats();

  it("shows at most three figures, as the tile has room for", () => {
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.length).toBeLessThanOrEqual(3);
  });

  it("reads each figure from its cleared source, its label in that source's words", () => {
    const adoption = getPortfolioProjectBySlug("tbh-intranet")!.outcomes!.find(
      (outcome) => outcome.label === "Adoption",
    )!;
    const metrics = getVentureBySlug("gogocash")!.metrics!;
    const metric = (label: string) =>
      metrics.find((item) => item.label === label)!;
    expect(stats).toEqual([
      {
        figure: adoption.value.split(" ")[0],
        label: "Adoption: employees on TBH Intranet",
        source: "TBH Intranet",
      },
      {
        figure: metric("Registered users").value,
        label: `${metric("Registered users").label} on GoGoCash`,
        source: "GoGoCash",
      },
      {
        figure: metric("Merchants").value,
        label: `${metric("Merchants").label} on GoGoCash`,
        source: "GoGoCash",
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

describe("statsFootnote", () => {
  const stat = (source: string): AboutStat => ({
    figure: "1",
    label: `Things on ${source}`,
    source,
  });

  it("names the cases the tile's figures come from, once each, in order", () => {
    expect(statsFootnote(aboutStats())).toBe(
      "From the TBH Intranet and GoGoCash case studies.",
    );
  });

  it("follows the figures: one case, or three", () => {
    expect(statsFootnote([stat("GoGoCash"), stat("GoGoCash")])).toBe(
      "From the GoGoCash case study.",
    );
    expect(statsFootnote([stat("A"), stat("B"), stat("C")])).toBe(
      "From the A, B and C case studies.",
    );
    expect(statsFootnote([])).toBe("");
  });
});
