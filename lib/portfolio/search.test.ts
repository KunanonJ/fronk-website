import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_FILTERS,
  categoryParam,
  matchesPortfolioFilter,
  portfolioSearchSchema,
} from "./search";

describe("portfolio search params", () => {
  const parse = (input: unknown) => v.parse(portfolioSearchSchema, input);

  it("defaults to all projects", () => {
    expect(parse({})).toEqual({ category: "all" });
  });

  it.each(PORTFOLIO_FILTERS.map((category) => [category]))(
    "reads ?category=%s",
    (category) => {
      expect(parse({ category })).toEqual({ category });
    },
  );

  it.each([["AI agents"], ["ai_agents"], [""], [1], [null], [["ai-agents"]]])(
    "falls back to all for %j without throwing",
    (category) => {
      expect(parse({ category })).toEqual({ category: "all" });
    },
  );

  it("drops unrelated params", () => {
    expect(parse({ category: "ai-agents", show: "user" })).toEqual({
      category: "ai-agents",
    });
  });
});

describe("portfolio categories", () => {
  const projects = getAllPortfolioProjects();

  it("lists every project category once, in project order", () => {
    const fromData = [
      ...new Set(projects.map((p) => categoryParam(p.category))),
    ];
    expect([...PORTFOLIO_CATEGORIES]).toEqual(fromData);
  });

  it("turns labels into URL values", () => {
    expect(categoryParam("Internal platform")).toBe("internal-platform");
    expect(categoryParam("AI agents")).toBe("ai-agents");
  });

  it("matches each project under all and under its own category only", () => {
    for (const p of projects) {
      expect(matchesPortfolioFilter(p.category, "all"), p.slug).toBe(true);
      const own = PORTFOLIO_CATEGORIES.filter((c) =>
        matchesPortfolioFilter(p.category, c),
      );
      expect(own, p.slug).toEqual([categoryParam(p.category)]);
    }
  });
});
