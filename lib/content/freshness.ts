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
 * facts synced to the owner's CV (recruiter-fit phase 1).
 */
export const SITE_UPDATED = "2026-11-10";
