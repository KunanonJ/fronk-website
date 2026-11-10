import { SITE_UPDATED } from "@/lib/content/freshness";
import { PERSON_NAME } from "@/lib/content/identity";
import {
  getPortfolioProjectBySlug,
  type PortfolioProject,
} from "@/lib/content/portfolio";
import {
  SITE_BASE,
  absoluteUrl,
  markdownResponse,
} from "@/src/server/text/markdown";

/**
 * /portfolio/<slug>.md: one project as Markdown, for agents that prefer text
 * to HTML (linked from the project page head as rel="alternate"
 * type="text/markdown"). Built from lib/content/portfolio.ts, like the page.
 */
export function buildPortfolioProjectMd(project: PortfolioProject): string {
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(`# ${project.name}`, "", project.tagline, "");
  push(
    `Source: ${SITE_BASE}/portfolio/${project.slug}  `,
    `Author: [${PERSON_NAME}](${absoluteUrl("/about")})  `,
    `Role: ${project.role}, ${project.organization} (${project.period})  `,
    `Category: ${project.category}  `,
    `Stack: ${project.stack.join(", ")}  `,
  );
  if (project.access === "public" && project.url)
    push(`Live: ${project.url}  `);
  else push("Access: internal tool (not public)  ");
  push(`Updated: ${SITE_UPDATED}`, "");

  push(project.summary, "");

  push("## Highlights", "");
  for (const h of project.highlights) push(`- ${h}`);
  push("");

  for (const s of project.sections) push(`## ${s.heading}`, "", s.body, "");

  if (project.beforeAfter)
    push(
      "## Before and after",
      "",
      `- **Before:** ${project.beforeAfter.before}`,
      `- **After:** ${project.beforeAfter.after}`,
      "",
    );

  if (project.workflow) {
    push(`## ${project.workflow.title}`, "");
    project.workflow.steps.forEach((step, index) =>
      push(
        `${index + 1}. ${step.label}${step.detail ? `: ${step.detail}` : ""}`,
      ),
    );
    push("");
  }

  if (project.architecture) {
    push("## Architecture", "");
    for (const layer of project.architecture.layers)
      push(
        `- **${layer.label}:** ${layer.nodes.map((n) => (n.note ? `${n.label} (${n.note})` : n.label)).join(", ")}`,
      );
    push("");
  }

  push(`All work: ${absoluteUrl("/portfolio")}`, "");
  return out.join("\n");
}

export function GET(slug: string): Response {
  const project = getPortfolioProjectBySlug(slug);
  if (!project) return markdownResponse("# Not found\n", 404);
  return markdownResponse(buildPortfolioProjectMd(project));
}
