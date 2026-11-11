import * as v from "valibot";
import { enumParam } from "@/lib/search/enumParam";

/*
 * /portfolio route options that run on every navigation (so they ship in the
 * entry bundle): keep this module free of anything but Valibot. The project
 * data (lib/content/portfolio) stays out; search.test.ts keeps the list below
 * in step with the categories it uses.
 */

/** URL value for a project category label: "AI agents" -> "ai-agents". */
export function categoryParam(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The project categories as URL values, in the order the filter lists them. */
export const PORTFOLIO_CATEGORIES = [
  "internal-platform",
  "ops-automation",
  "internal-tool",
  "ai-agents",
  "website",
] as const;

/** Every filter: all projects, then one per category. */
export const PORTFOLIO_FILTERS = ["all", ...PORTFOLIO_CATEGORIES] as const;
export type PortfolioFilter = (typeof PORTFOLIO_FILTERS)[number];

/** The default filter; stripped from the URL, so /portfolio stays clean. */
export const PORTFOLIO_SEARCH_DEFAULTS = { category: "all" } as const;

/**
 * /portfolio search params (TanStack Router `validateSearch`, Standard
 * Schema): `?category=internal-platform|ops-automation|internal-tool|ai-agents|website`
 * narrows the projects. A missing or unknown value falls back to all
 * projects without an error.
 */
export const portfolioSearchSchema = v.object({
  category: enumParam(PORTFOLIO_FILTERS, PORTFOLIO_SEARCH_DEFAULTS.category),
});

/** Whether a project with this category label shows under `filter`. */
export function matchesPortfolioFilter(
  category: string,
  filter: PortfolioFilter,
): boolean {
  return filter === "all" || categoryParam(category) === filter;
}
