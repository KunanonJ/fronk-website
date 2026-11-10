/**
 * Self-hosted company logos for /resume (visual-redesign Phase 5; ux-audit
 * finding 12), keyed by the `logoDomain` on resume entries. A domain that is
 * not listed renders the initials tile, so the page never requests an icon
 * from a third-party host.
 *
 * Files live in public/brand/companies/ (the two ventures reuse their marks
 * in public/brand/). Each was taken from the sharpest available copy of the
 * favicon /resume used to load from DuckDuckGo's favicon CDN; domains whose
 * favicon was missing, or only 16 px, fall back to initials.
 */
export const COMPANY_LOGOS: Readonly<Record<string, string>> = {
  "3bb.co.th": "/brand/companies/3bb.webp",
  "bitkub.com": "/brand/companies/bitkub.webp",
  "coins.co.th": "/brand/companies/coins.webp",
  "gogocash.co": "/brand/gogocash.svg",
  "ku.ac.th": "/brand/companies/kasetsart.webp",
  "manut.xyz": "/brand/manut-144.webp",
  "playbux.co": "/brand/companies/playbux.webp",
  "ted.com": "/brand/companies/ted.webp",
};

/** The local logo path for a company domain, if one is self-hosted. */
export function companyLogoSrc(domain: string | undefined): string | undefined {
  if (!domain) return undefined;
  const key = domain
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
  return COMPANY_LOGOS[key];
}

/** Two-letter initials for the fallback tile; a leading "The" is skipped. */
export function companyInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const meaningful =
    words.length > 1 && /^the$/i.test(words[0]!) ? words.slice(1) : words;
  if (meaningful.length === 0) return "·";
  if (meaningful.length === 1) return meaningful[0]!.slice(0, 2).toUpperCase();
  return (meaningful[0]![0]! + meaningful[1]![0]!).toUpperCase();
}
