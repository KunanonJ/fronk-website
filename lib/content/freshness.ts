/**
 * When the site's content last changed, for sitemap `lastmod`, the ProfilePage
 * `dateModified`, and the "Updated" line in llms.txt and the agent docs.
 * Engines prefer dated, fresh sources, so keep this truthful: bump it in the
 * same change that edits page content in `lib/content`, and never set a
 * future date (freshness.test.ts checks).
 *
 * Use the UTC date: sitemaps read `lastmod` as UTC, so a Bangkok-morning date
 * would sit in the future for crawlers.
 *
 * 2026-11-10: the bento redesign (Phase 7) finished and the FDE positioning
 * pass (EO-1 to EO-3) and the final review fixes shipped. Same day: career
 * facts synced to the owner's CV (recruiter-fit phase 1), then the recruiter
 * path: the role-first Home hero and the hiring contact (phase 2).
 *
 * 2026-11-11: case-study evidence (recruiter-fit phase 3): outcomes and "my
 * part" on the case studies, delivery on /proof, GoGoCash's totals as of
 * October 2026, and this site as a portfolio project.
 *
 * 2026-11-20: availability and career facts (owner direction 20-11-26): the
 * Binary Holdings role ended in November 2026; he is building GoGoCash and
 * Manut AI and is not looking for a full-time role.
 *
 * 2026-11-21: /about says each thing once (UX sweep), and its Now section
 * calls the owner a Protocol Camp cohort 2025 alum (the cohort ended in
 * January 2026). Same day: the skills hub moved to Superstacks v6.7.0 (22
 * skills, with `ama` and `owner-decisions` new). Same day: /open-source and
 * a strip on Home list the owner's three MIT projects from a GitHub snapshot
 * (lib/content/openSource.generated.json).
 */
export const SITE_UPDATED = "2026-11-21";
