import { SITE_UPDATED } from "@/lib/content/freshness";
import { PERSON_NAME } from "@/lib/content/identity";
import {
  OPEN_SOURCE_PROJECTS,
  OPEN_SOURCE_SYNCED_ON,
  openSourcePage,
  type OpenSourceProject,
} from "@/lib/content/openSource";
import { SITE_ORIGIN } from "@/lib/site";
import { absoluteUrl, markdownResponse } from "@/src/server/text/markdown";

const PAGE = "/open-source";
const day = (iso: string) => iso.slice(0, 10);

/**
 * One project as Markdown under a `level` heading ("##" here, "###" in
 * llms-full.txt). Unlike the page, it states the stars and forks at any
 * count, with the day the snapshot was read: agents get the facts.
 */
export function projectMarkdown(
  p: OpenSourceProject,
  level: "##" | "###",
): string[] {
  const { facts } = p;
  const lines = [
    `${level} ${p.name}`,
    "",
    `${p.kind}. ${p.tagline}`,
    "",
    p.summary,
    "",
    `- **Repository:** ${facts.url}`, // DRAFT
    `- **License:** ${facts.license}`, // DRAFT
  ];
  if (facts.release)
    lines.push(
      `- **Latest release:** [${facts.release.tag}](${facts.release.url}), ${day(facts.release.publishedAt)}`, // DRAFT
    );
  lines.push(
    `- **Last commit on ${facts.defaultBranch}:** ${day(facts.lastCommitAt)}`, // DRAFT
  );
  if (facts.language) lines.push(`- **GitHub language:** ${facts.language}`); // DRAFT
  lines.push(
    `- **Stars and forks on GitHub:** ${facts.stars} and ${facts.forks}`, // DRAFT
    `- **Stack:** ${p.stack.join(", ")}`, // DRAFT
  );
  if (p.more)
    lines.push(`- **${p.more.mdLabel}:** ${absoluteUrl(p.more.href)}`);
  // Each step under its label, fenced as `text` when it is typed in Claude
  // Code (a slash command, not a shell's) and `sh` when in a terminal.
  for (const step of p.install ?? [])
    lines.push(
      "",
      `${step.label}:`,
      "",
      `\`\`\`${step.fence}`,
      step.command,
      "```",
    );
  return lines;
}

/**
 * /open-source.md: the page as Markdown, for agents that prefer text to HTML
 * (linked from the page head as rel="alternate" type="text/markdown"). Built
 * from the same modules as the page, in the page's order.
 */
export function buildOpenSourceMd(): string {
  return [
    `# ${openSourcePage.eyebrow}: ${PERSON_NAME} (Fronk / KunanonJ)`,
    "",
    `Source: ${SITE_ORIGIN}${PAGE}  `,
    `Updated: ${SITE_UPDATED}  `,
    `GitHub numbers as of: ${OPEN_SOURCE_SYNCED_ON}`, // DRAFT
    "",
    openSourcePage.lead,
    "",
    ...OPEN_SOURCE_PROJECTS.flatMap((p) => [...projectMarkdown(p, "##"), ""]),
    `More on GitHub: ${openSourcePage.github.href}`, // DRAFT
    "",
  ].join("\n");
}

export function GET(): Response {
  return markdownResponse(buildOpenSourceMd());
}
