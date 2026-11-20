/*
 * /resume route options read by the route's head(), which ships in the entry
 * bundle: keep this module free of imports. The page has no search params
 * since the "Snapshot" redesign (20-11-26) dropped the Detailed / Compact
 * switch; an old `?view=compact` link still opens the page.
 */

/** /resume head() copy; the description is also the page lead when the CMS has no summary. */
export const RESUME_META = {
  title: "Resume",
  description:
    "Résumé of Kunanon Jarat (Fronk): AI engineering lead in Bangkok, with experience in AI product delivery, internal platforms and fintech.",
  path: "/resume",
} as const;
