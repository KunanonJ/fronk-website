import type { PortfolioProject } from "@/lib/content/portfolio";

/*
 * What remains of the bento portfolio's parts after the profile redesign's
 * cutover (Phase 6) moved the portfolio pages to the case-study template:
 * the Access wording the live project pages printed, which the case
 * template's `caseAccess` repeats (lib/content/caseStudy.test.ts compares
 * them). Phase 8 removes this file with the rest of the old design.
 */

/**
 * Meta-strip value for the project's access. "No public link" is what the
 * data shows for every internal project (none carries a `url`), and what its
 * Markdown twin prints. Whether a tool can be reached from outside is not in
 * the data: only the intranet's own copy mentions a login.
 */
export function accessDetail(access: PortfolioProject["access"]): string {
  return access === "internal" ? "Internal tool (no public link)" : "Public";
}
