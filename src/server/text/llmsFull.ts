import { FAQ_ITEMS } from "@/lib/content/faq";
import { SITE_UPDATED } from "@/lib/content/freshness";
import {
  OPEN_TO_ROLES,
  PERSON_CUSTOMER_WORK,
  PERSON_NAME,
  PERSON_SOLOPRENEUR,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import { operatingModel } from "@/lib/content/operatingModel";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import {
  SKILLS_REPO_URL,
  SKILLS_VERSION,
  getAllSkills,
} from "@/lib/content/skills";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";
import { getAllVentures } from "@/lib/content/ventures";
import { siteConfig } from "@/lib/site";

/**
 * /llms-full.txt: the whole public fact base in one fetch, for answer engines
 * and agents (llms.txt is the short index). Built only from lib/content, so it
 * can't say anything the site doesn't. The hidden blog and press are left out.
 */
export function buildLlmsFull(): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(`# ${PERSON_NAME} (Fronk / KunanonJ): full profile`, "");
  push(`Site: ${base}  `, `Updated: ${SITE_UPDATED}`, "");
  push(PERSON_SUMMARY, "", PERSON_CUSTOMER_WORK, "", PERSON_SOLOPRENEUR, "");
  push(`Availability: ${OPEN_TO_ROLES.sentence}`, "");

  push("## Career", "");
  for (const section of RESUME_TIMELINE_FALLBACK) {
    push(`### ${section.title}`, "");
    for (const item of section.items) {
      push(`- **${item.title}**, ${item.org} (${item.period})`);
      for (const bullet of item.bullets ?? []) push(`  - ${bullet}`);
    }
    push("");
  }

  push("## Solopreneur operating model", "", operatingModel.intro, "");
  for (const stage of operatingModel.stages) {
    push(
      `- **${stage.label}.** ${stage.principle} ${stage.practice} Skills: ${stage.skills.join(", ")}. Seen in: ${stage.evidence.map((e) => `${e.label} (${base}${e.href})`).join(", ")}.`,
    );
  }
  push("", `Reusable version: ${base}/operating-model.md`, "");

  push("## AI engineering and internal tools (The Binary Holdings)", "");
  for (const p of getAllPortfolioProjects()) {
    push(`### ${p.name}`, "");
    push(`${base}/portfolio/${p.slug}  `);
    push(`Role: ${p.role}, ${p.organization} (${p.period})  `);
    push(`Stack: ${p.stack.join(", ")}`, "");
    push(p.summary, "");
    for (const h of p.highlights) push(`- ${h}`);
    push("");
    for (const s of p.sections) push(`**${s.heading}.** ${s.body}`, "");
  }

  push("## Ventures", "");
  for (const v of getAllVentures()) {
    push(`### ${v.name} (${v.year})`, "");
    push(`${base}/ventures/${v.slug} · ${v.url}  `);
    push(
      `Role: ${v.role}  `,
      ...(v.offer ? [`Pricing: ${v.offer.label}  `] : []),
      `Stack: ${v.stack.join(", ")}`,
      "",
    );
    push(v.description, "");
    for (const m of v.metrics ?? []) push(`- ${m.value} ${m.label}`);
    if (v.metrics?.length) push("");
    if (v.caseStudy) {
      push(v.caseStudy.intro, "");
      for (const s of v.caseStudy.sections)
        push(`**${s.heading}.** ${s.body}`, "");
    }
  }

  push("## Topic hubs", "");
  for (const t of getAllTopicPillars("en")) {
    push(
      `### ${t.h1}`,
      "",
      `${base}/topics/${t.slug} (Thai: ${base}/th/topics/${t.slug})`,
      "",
    );
    push(t.lede, "");
    for (const s of t.sections) push(`**${s.heading}.** ${s.body}`, "");
    for (const f of t.faqs) push(`Q: ${f.question}`, `A: ${f.answer}`, "");
  }

  const skills = getAllSkills();
  push(`## Superstacks agent skills (${SKILLS_VERSION}, MIT)`, "");
  push(
    `${skills.length} skills for Claude Code, Codex and Cursor: ${SKILLS_REPO_URL}`,
    "",
  );
  for (const s of skills) {
    const origin = s.source ? `adapted from ${s.source.name}` : "original";
    push(
      `- [${s.name}](${base}/skills/${s.slug}) (${origin}): ${s.description}`,
    );
  }
  push("");

  push("## FAQ", "");
  for (const f of FAQ_ITEMS) push(`Q: ${f.question}`, `A: ${f.answer}`, "");

  return out.join("\n");
}

export function GET(): Response {
  return new Response(buildLlmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
