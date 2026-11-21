/*
 * Days in words for the open-source facts (21-11-26): "Updated 5 days ago"
 * on /open-source and Home's strip. Counted in whole UTC days, so a commit
 * late on the 16th and a visit early on the 21st are 5 days apart wherever
 * the visitor is. DaysAgo (components/ds) shows the date until the browser
 * has a clock to count from.
 */

const DAY = 86_400_000;

/** Days since 1970-01-01 (UTC) for a time in ms. */
export function dayNumber(ms: number): number {
  return Math.floor(ms / DAY);
}

/** "16 Nov 2026": the UTC day of an ISO date or time. */
export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * How long ago `iso` was, seen from the UTC day `today`: "today",
 * "yesterday", "5 days ago", "last month", "5 months ago", "2 years ago".
 * Null for a day after `today` (a slow clock), so the caller shows the date.
 */
export function relativeDay(iso: string, today: number): string | null {
  const days = today - dayNumber(Date.parse(iso));
  if (!Number.isFinite(days) || days < 0) return null;
  const words = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (days < 30) return words.format(-days, "day");
  if (days < 365)
    return words.format(-Math.max(1, Math.round(days / 30.4375)), "month");
  return words.format(-Math.round(days / 365.25), "year");
}
