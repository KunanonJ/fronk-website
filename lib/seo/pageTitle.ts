import { siteConfig } from "@/lib/site";

/** What the root layout's title template appends to every page title. */
export const TITLE_SUFFIX = ` — ${siteConfig.name}`;

/**
 * Longest full title (suffix included) we aim for. Google shows roughly the
 * first 60 characters, and short, distinct titles are what it reuses as
 * sitelink labels under the home result.
 */
export const MAX_TITLE_LENGTH = 60;

/**
 * Title for a named page that has a tagline (a venture, a portfolio project).
 * Returns "Name: tagline" when the full title still fits in MAX_TITLE_LENGTH,
 * otherwise just the name. The tagline stays in the description and the page.
 */
export function namedPageTitle(name: string, tagline?: string): string {
  const cleanTagline = tagline?.trim().replace(/\.$/, "");
  if (!cleanTagline) return name;
  const withTagline = `${name}: ${cleanTagline}`;
  return withTagline.length + TITLE_SUFFIX.length <= MAX_TITLE_LENGTH
    ? withTagline
    : name;
}
