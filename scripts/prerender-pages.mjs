/**
 * Pages the prerender crawl cannot reach through <a> links, listed for
 * vite.config.mts. The Thai topic hubs are linked only through hreflang.
 * prerender-pages.test.ts keeps this list in step with TOPIC_SLUGS.
 */
export const EXTRA_PRERENDER_PATHS = [
  "/th/topics/ai-transformation-thailand",
  "/th/topics/erp-crm-internal-systems",
  "/th/topics/tech-startup-thailand-sea",
];
