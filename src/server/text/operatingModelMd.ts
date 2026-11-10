import { SITE_UPDATED } from "@/lib/content/freshness";
import { PERSON_NAME, PERSON_SOLOPRENEUR } from "@/lib/content/identity";
import { operatingModel } from "@/lib/content/operatingModel";
import {
  PACK_INSTALL,
  SKILLS_REPO_URL,
  getAllSkills,
} from "@/lib/content/skills";
import { siteConfig } from "@/lib/site";

/**
 * /operating-model.md: the solopreneur operating model as a reusable
 * document. Each stage names its principle, the skills that run it (with
 * their descriptions) and the shipped work that shows it, plus how to adopt
 * it in another project.
 */
export function buildOperatingModelMd(): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const skills = new Map(getAllSkills().map((s) => [s.slug, s]));
  const out: string[] = [
    `# The solopreneur operating model: ${PERSON_NAME}`,
    "",
    `Source: ${base}/about#how-i-ship  `,
    `Updated: ${SITE_UPDATED}`,
    "",
    PERSON_SOLOPRENEUR,
    "",
    operatingModel.intro,
    "",
  ];
  operatingModel.stages.forEach((stage, index) => {
    out.push(`## ${index + 1}. ${stage.label}`, "");
    out.push(`**Principle:** ${stage.principle}  `);
    out.push(`**Practice:** ${stage.practice}`, "");
    out.push("Skills:");
    for (const slug of stage.skills) {
      const skill = skills.get(slug);
      out.push(
        `- [${slug}](${base}/skills/${slug})${skill ? `: ${skill.description}` : ""}`,
      );
    }
    out.push("");
    out.push(
      `Seen in: ${stage.evidence.map((e) => `[${e.label}](${base}${e.href})`).join(", ")}`,
      "",
    );
  });
  out.push("## Use it in another project", "");
  out.push(
    `1. Install the Superstacks skills (${SKILLS_REPO_URL}): in Claude Code, \`${PACK_INSTALL.claudeCode.join("` then `")}\`; elsewhere, \`${PACK_INSTALL.npx}\`.`,
  );
  out.push(
    "2. Run each ticket through the four stages in order, using the skills listed for the stage.",
  );
  out.push(
    "3. Keep the principle of each stage as the tie-breaker when a decision is unclear.",
  );
  out.push("");
  return out.join("\n");
}

export function GET(): Response {
  return new Response(buildOperatingModelMd(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
