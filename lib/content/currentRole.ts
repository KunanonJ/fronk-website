/**
 * The latest employed role, in one place. The identity summary, the FDE hub
 * proof line and the résumé's first Experience row all read it, so its
 * months cannot drift between them (the site once said November where the
 * owner's CV says September). It has its own small module because the
 * résumé data, which Home imports, reads it too.
 *
 * The role ended in November 2026 (owner direction 20-11-26): every
 * sentence built from it is in the past tense and names both months.
 */
export const LATEST_ROLE = {
  title: "IT Manager & AI Engineering Lead",
  organization: "The Binary Holdings",
  /**
   * Start and end months: long for prose, short for period columns, Thai
   * for the Thai hubs. resumeFacts.test.ts checks each three name the same
   * month.
   */
  since: "September 2025",
  sinceShort: "Sep 2025",
  sinceThai: "กันยายน 2025",
  until: "November 2026",
  untilShort: "Nov 2026",
  untilThai: "พฤศจิกายน 2026",
} as const;
