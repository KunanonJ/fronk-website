/*
 * Every case study's address (now-building-and-genz Phase 6), for the 404's
 * "I'm feeling lucky": the five projects, then the two ventures, in the order
 * of allCaseStudies() (lib/content/caseStudy.ts). A plain list, so the 404's
 * lazy chunk carries a few addresses instead of the portfolio's content;
 * casePaths.test.ts keeps it equal to the content, so a new case fails the
 * test until it is listed here.
 */
export const CASE_PATHS = [
  "/portfolio/tbh-intranet",
  "/portfolio/node-validator-automation",
  "/portfolio/email-signature-generator",
  "/portfolio/ai-automation",
  "/portfolio/kunanonj-com",
  "/ventures/manut",
  "/ventures/gogocash",
] as const;
