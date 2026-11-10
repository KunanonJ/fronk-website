/**
 * The current employed role, in one place. The identity summary, the FDE hub
 * proof line and the first résumé row all read it, so the start date cannot
 * drift between them (the site once said November where the owner's CV says
 * September). It has its own small module because the résumé data, which
 * Home imports, reads it too.
 */
export const CURRENT_ROLE = {
  title: "IT Manager & AI Engineering Lead",
  organization: "The Binary Holdings",
  /**
   * Start month: long for prose, short for period columns, Thai for the Thai
   * hubs. resumeFacts.test.ts checks the three name the same month.
   */
  since: "September 2025",
  sinceShort: "Sep 2025",
  sinceThai: "กันยายน 2025",
} as const;
