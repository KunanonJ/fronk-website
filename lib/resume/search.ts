import * as v from "valibot";

/*
 * /resume route options that run on every navigation (so they ship in the
 * entry bundle): keep this module free of anything but Valibot.
 */

export const RESUME_DETAILS = ["detailed", "compact"] as const;
export type ResumeDetail = (typeof RESUME_DETAILS)[number];

/** The default detail level; stripped from the URL, so /resume stays clean. */
export const RESUME_SEARCH_DEFAULTS = { view: "detailed" } as const;

/**
 * /resume search params (TanStack Router `validateSearch`, Standard Schema):
 * `?view=compact` hides the bullet lists. A missing or unknown value falls
 * back to detailed without an error.
 */
export const resumeSearchSchema = v.object({
  view: v.optional(
    v.fallback(v.picklist(RESUME_DETAILS), RESUME_SEARCH_DEFAULTS.view),
    RESUME_SEARCH_DEFAULTS.view,
  ),
});

/** /resume head() copy; the description is also the page lead when the CMS has no summary. */
export const RESUME_META = {
  title: "Resume",
  description:
    "Kunanon Jarat (Fronk) — Founder, IT manager, AI engineering lead, and project leader across fintech, AI, and Web3.",
  path: "/resume",
} as const;
