import { SITE_UPDATED } from "@/lib/content/freshness";
import { PERSON_NAME } from "@/lib/content/identity";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { getAllSkills } from "@/lib/content/skills";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";
import { getAllVentures } from "@/lib/content/ventures";
import { siteConfig } from "@/lib/site";

/**
 * /sitemap.md: a human- and agent-readable route map, generated from
 * lib/content so new projects, skills and topics appear without hand edits.
 * Hidden sections (blog, press) are listed as hidden so agents don't cite them.
 */

type Row = readonly [route: string, name: string, notes: string];

function table(rows: readonly Row[]): string[] {
  return [
    "| Route | Name | Notes |",
    "|---|---|---|",
    ...rows.map(
      ([route, name, notes]) => `| \`${route}\` | ${name} | ${notes} |`,
    ),
  ];
}

export function buildSitemapMd(): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const pages: Row[] = [
    ["/", "Home", "Who he is, experience, ventures, selected work, Bangkok"],
    [
      "/about",
      "About",
      "Story, career path, principles, GitHub activity, stack, FAQ",
    ],
    [
      "/portfolio",
      "Portfolio",
      "AI agents and internal tools built at The Binary Holdings",
    ],
    ...getAllPortfolioProjects().map((p): Row => [
      `/portfolio/${p.slug}`,
      p.name,
      p.tagline,
    ]),
    ...getAllVentures().map((v): Row => [
      `/ventures/${v.slug}`,
      v.name,
      v.tagline,
    ]),
    ...getAllTopicPillars("en").map((t): Row => [
      `/topics/${t.slug}`,
      t.h1,
      "Topic hub (EN), Thai mirror under /th/topics/",
    ]),
    [
      "/skills",
      "Skills",
      `Superstacks: ${getAllSkills().length} agent skills, install commands, credits`,
    ],
    [
      "/skills/[slug]",
      "Skill",
      "One skill: install, SKILL.md source, files, origin",
    ],
    ["/learn", "Learn", "Index of topic hubs and notes"],
    ["/examples", "Examples", "Scenarios by persona"],
    ["/stack", "Stack", "Tools by stage"],
    ["/proof", "Proof", "Venture metrics and case studies"],
    ["/build", "Build", "Public build board"],
    ["/contact", "Contact", "Email and contact form"],
    ["/resume", "Resume", "Career timeline; noindex"],
    ["/blog", "Blog", "Hidden: noindex, not linked"],
    ["/press", "Press", "Hidden: noindex, not linked"],
    ["/studio", "Sanity Studio", "CMS; not for scraping"],
  ];
  const redirects: Row[] = [
    ["/ventures", "/#ventures", "Ventures card on Home"],
    ["/work", "/#ventures", "Legacy"],
    ["/stock/asme", "/about", "Legacy"],
    ["/now", "/", "Legacy"],
    ["/writing, /writing/[slug]", "/blog, /blog/[slug]", "Legacy"],
  ];
  return [
    `# Sitemap: ${PERSON_NAME} (Fronk / KunanonJ)`,
    "",
    `Canonical site: ${base}  `,
    `Updated: ${SITE_UPDATED}`,
    "",
    "## Pages",
    "",
    ...table(pages),
    "",
    "## Redirects",
    "",
    "| From | To | Notes |",
    "|---|---|---|",
    ...redirects.map(
      ([from, to, notes]) => `| \`${from}\` | \`${to}\` | ${notes} |`,
    ),
    "",
    "## Supporting resources",
    "",
    "- Agents index: [/agents.md](/agents.md)",
    "- Solopreneur operating model: [/operating-model.md](/operating-model.md)",
    "- Plain text for LLMs: [/llms.txt](/llms.txt)",
    "- Coding guide: [/skills.md](/skills.md)",
    "- Skills catalog (JSON): [/skills.json](/skills.json)",
    "- XML sitemap: [/sitemap.xml](/sitemap.xml)",
    "",
  ].join("\n");
}

export function GET(): Response {
  return new Response(buildSitemapMd(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
