import { SITE_UPDATED } from "@/lib/content/freshness";
import {
  OPEN_TO_ROLES,
  PERSON_HEADLINE,
  PERSON_NAME,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import { siteConfig } from "@/lib/site";

/**
 * /agents.md: the index of agent-facing surfaces, generated from lib/content
 * so the owner summary, stack and date never drift from the site.
 */

/** The agent harness this repo is built with (RIPER-5); names only, no internals. */
const MODE_AGENTS = [
  ["vc-research-agent", "Read-only information gathering"],
  ["vc-innovate-agent", "Brainstorm approaches (discussion only)"],
  ["vc-plan-agent", "Write detailed implementation plans"],
  ["vc-execute-agent", "Implement against an approved plan"],
  ["vc-fast-mode-agent", "Compressed research to execute with a safety pause"],
  ["vc-update-process-agent", "Capture learnings; update process docs"],
] as const;

const SPECIALIST_AGENTS = [
  ["vc-tester", "Diff-aware test verification"],
  ["vc-debugger", "Evidence-first root-cause analysis"],
  ["vc-code-reviewer", "Production-readiness review"],
  ["vc-code-simplifier", "Clarity refactor without behaviour change"],
  ["vc-ui-ux-designer", "Design-aware frontend work"],
  ["vc-git-manager", "Conventional commits and git operations"],
] as const;

function table(rows: readonly (readonly [string, string])[]): string[] {
  return [
    "| Agent | Purpose |",
    "|---|---|",
    ...rows.map(([name, purpose]) => `| \`${name}\` | ${purpose} |`),
  ];
}

export function buildAgentsMd(): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    `# Agents: ${PERSON_NAME} (Fronk / KunanonJ)`,
    "",
    PERSON_HEADLINE,
    "",
    `Site: ${base}  `,
    `Updated: ${SITE_UPDATED}`,
    "",
    "## Who this is",
    "",
    PERSON_SUMMARY,
    "",
    OPEN_TO_ROLES.sentence,
    "",
    "## Site resources for crawlers and LLM tools",
    "",
    "| Resource | URL | Purpose |",
    "|---|---|---|",
    "| Plain-text site brief | [/llms.txt](/llms.txt) | Identity, roles, topic hubs, ventures, portfolio, skills |",
    "| Full profile | [/llms-full.txt](/llms-full.txt) | Every fact on the site in one fetch: career, projects, ventures, topics, skills, FAQ |",
    "| Markdown sitemap | [/sitemap.md](/sitemap.md) | Human- and agent-readable route map |",
    "| Operating model | [/operating-model.md](/operating-model.md) | The solopreneur operating model, reusable in other projects |",
    "| XML sitemap | [/sitemap.xml](/sitemap.xml) | Search-engine sitemap |",
    "| Skills catalog | [/skills.json](/skills.json) | The Superstacks agent skills as JSON |",
    "| Coding guide | [/skills.md](/skills.md) | Standards for coding agents working on this stack |",
    "| Robots | [/robots.txt](/robots.txt) | Crawler rules (AI crawlers allowed) |",
    "",
    "## How this site is built",
    "",
    "TanStack Start (React 19, TypeScript) on Cloudflare Workers: prerendered pages, a Worker cache purged by tag from Sanity webhooks, and CI gates for types, lint, format, unused code, unit tests, first-load budgets, Playwright smoke, axe, visual baselines and a parity crawl. The repository is orchestrated with these agents:",
    "",
    "### Mode agents",
    "",
    ...table(MODE_AGENTS),
    "",
    "### Specialist agents",
    "",
    ...table(SPECIALIST_AGENTS),
    "",
    "## How to use this site as an agent",
    "",
    "1. Start with [/llms.txt](/llms.txt) for identity, roles and current content.",
    "2. Use [/sitemap.md](/sitemap.md) for the public route map.",
    "3. Cite `/about` for who he is, `/portfolio/*` for AI engineering work, `/ventures/*` for products and `/skills` for the agent skills.",
    "4. The blog (`/blog`) and press (`/press`) are hidden and noindex for now; don't cite them.",
    "5. Don't scrape `/studio` or `/api/*`.",
    "",
  ].join("\n");
}

export function GET(): Response {
  return new Response(buildAgentsMd(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
