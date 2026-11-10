import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";

/**
 * Title and meta description for each content page, in one import-free
 * module. Route `head()` options are not code-split, so whatever a route's
 * head imports ships in the entry chunk every page loads; reading these
 * strings from the page's content module pulled whole modules (every SKILL.md,
 * all topic hubs, the portfolio) into it. Content modules read from here too,
 * so each string has one source.
 */
export const PAGE_META = {
  about: {
    // The About h1 restates this title (aboutPage.test.ts), so it changes with the hero copy.
    title: "About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok",
    description:
      "Kunanon Jarat (Fronk): AI Engineering Lead at The Binary Holdings, founder of GoGoCash, builder of Manut AI. Open to FDE and AI roles, Bangkok or remote.",
  },
  build: {
    title: "Build",
    description:
      "A thin public board of what’s next, in flight, and recently shipped — not roadmap theater.",
  },
  contact: {
    title: "Contact",
    description:
      "Email Kunanon Jarat (Fronk) or send a message about fintech, AI, ERP/CRM or startups in Bangkok and Southeast Asia.",
  },
  examples: {
    title: "Examples",
    description:
      "What changes when the work is operator-first — ventures, systems, and a few creative moments from Bangkok.",
  },
  learn: {
    title: "Learn",
    description: `How I think about AI transformation, internal systems, and shipping from Bangkok — hubs, ${BLOG_PUBLIC ? "writing, " : ""}and operator notes.`,
  },
  portfolio: {
    title: "Portfolio",
    description:
      "Internal tools, automations and AI agents built at The Binary Holdings. They run behind a login, so each page shows what the product does and how it is built rather than a live link.",
  },
  press: {
    title: "Press",
    description:
      "Selected coverage and mentions. Click through to read the full piece.",
  },
  proof: {
    title: "Proof",
    description:
      "Honest signals — venture metrics and case studies. No invented scores.",
  },
  skills: {
    title: "Skills",
    description:
      "Twenty MIT-licensed agent skills for Claude Code, Codex and Cursor: planning, TDD, verify loops, code review and draft PRs. Install the whole pack or one skill.",
  },
  stack: {
    title: "Stack",
    description:
      "Tools evidenced in public GitHub — @KunanonJ and @mygogocash — not a wishlist. TypeScript is the through-line.",
  },
} as const;
