import { describe, expect, it } from "vitest";
import { SITE_UPDATED } from "@/lib/content/freshness";
import {
  CURRENT_ROLE,
  OPEN_TO_ROLES,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import {
  getAllPortfolioProjects,
  isPersonalProject,
} from "@/lib/content/portfolio";
import { getAllTopicPillars } from "@/lib/content/topics/pillars";
import { getAllVentures } from "@/lib/content/ventures";
import { buildAgentsMd } from "./agentsMd";
import { GET as llmsTxt } from "./llms";
import { buildSitemapMd } from "./sitemapMd";

describe("agent docs", () => {
  it("agents.md carries the identity, availability and date", () => {
    const md = buildAgentsMd();
    expect(md).toContain(PERSON_SUMMARY);
    expect(md).toContain(OPEN_TO_ROLES.sentence);
    expect(md).toContain(`Updated: ${SITE_UPDATED}`);
    expect(md).not.toMatch(/Next\.js|OpenNext/);
  });

  it("sitemap.md lists every project, venture and topic, and marks blog and press hidden", () => {
    const md = buildSitemapMd();
    for (const p of getAllPortfolioProjects())
      expect(md).toContain(`/portfolio/${p.slug}`);
    for (const v of getAllVentures())
      expect(md).toContain(`/ventures/${v.slug}`);
    for (const t of getAllTopicPillars("en"))
      expect(md).toContain(`/topics/${t.slug}`);
    expect(md).toMatch(/`\/blog` \| Blog \| Hidden/);
    expect(md).toMatch(/`\/press` \| Press \| Hidden/);
  });

  it("llms.txt leads with the identity summary and lists the roles", async () => {
    const text = await (await llmsTxt()).text();
    const firstParagraph = text.split("\n\n")[1];
    expect(firstParagraph).toBe(PERSON_SUMMARY);
    expect(text).toContain(OPEN_TO_ROLES.sentence);
    expect(text).toContain("## Roles");
    expect(text).toContain(
      `- ${CURRENT_ROLE.title}, ${CURRENT_ROLE.organization} (${CURRENT_ROLE.sinceShort} to Present)`,
    );
    // Employment only: the independent projects are not roles.
    expect(text).not.toMatch(/^- Founder,/m);
    expect(text).toContain(`**Updated:** ${SITE_UPDATED}`);
  });
});

describe("the portfolio in llms.txt and llms-full.txt", () => {
  /** The project headings under each `## ` heading, in order. */
  function projectsByHeading(text: string): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    let heading = "";
    for (const line of text.split("\n")) {
      if (line.startsWith("## ")) heading = line.slice(3);
      else if (line.startsWith("### "))
        (out[heading] ??= []).push(line.slice(4).replace(/ \(\d{4}\)$/, ""));
    }
    return out;
  }

  it("lists the employer's projects under its name and this site apart", async () => {
    const { buildLlmsFull } = await import("./llmsFull");
    const employer = getAllPortfolioProjects()
      .filter((p) => !isPersonalProject(p))
      .map((p) => p.name);
    for (const text of [await (await llmsTxt()).text(), buildLlmsFull()]) {
      const groups = projectsByHeading(text);
      // No heading credits The Binary Holdings with his own project.
      expect(
        groups["AI engineering and internal tools (The Binary Holdings)"],
      ).toEqual(employer);
      expect(groups["Personal projects"]).toEqual(["kunanonj.com"]);
    }
    expect(employer).toHaveLength(4);
  });
});

describe("llms-full.txt", () => {
  it("holds the identity, every project, venture and topic, and no hidden blog content", async () => {
    const { buildLlmsFull } = await import("./llmsFull");
    const text = buildLlmsFull();
    expect(text).toContain(PERSON_SUMMARY);
    for (const p of getAllPortfolioProjects())
      expect(text).toContain(`/portfolio/${p.slug}`);
    for (const v of getAllVentures())
      expect(text).toContain(`/ventures/${v.slug}`);
    for (const t of getAllTopicPillars("en"))
      expect(text).toContain(`/topics/${t.slug}`);
    expect(text).not.toContain("/blog/");
    expect(text).not.toContain("/press");
  });

  it("states each project's outcomes and his part under its summary", async () => {
    const { buildLlmsFull } = await import("./llmsFull");
    const text = buildLlmsFull();
    for (const project of getAllPortfolioProjects()) {
      const start = text.indexOf(`### ${project.name}\n`);
      const next = text.indexOf("\n### ", start + 1);
      const block = text.slice(start, next === -1 ? undefined : next);
      const outcomes = project.outcomes ?? [];
      const line = `Outcome: ${outcomes.map((o) => `${o.label}: ${o.value}`).join("; ")}.`;
      expect(block.includes("Outcome: "), project.slug).toBe(
        outcomes.length > 0,
      );
      expect(block.includes(line), project.slug).toBe(outcomes.length > 0);
      expect(block.includes("My part: "), project.slug).toBe(
        Boolean(project.myPart),
      );
      expect(block).toContain(project.myPart ?? "");
      // After the summary, before the highlights.
      expect(block.indexOf(project.summary)).toBeLessThan(
        block.indexOf(`- ${project.highlights[0]}`),
      );
    }
    expect(text).toContain(
      "Outcome: Adoption: 50+ employees; Build cycles: 4 months to 1 week.",
    );
  });

  it("prints a venture's running total with the month it was true", async () => {
    const { buildLlmsFull } = await import("./llmsFull");
    const text = buildLlmsFull();
    const metrics = getAllVentures().flatMap((v) => v.metrics ?? []);
    for (const metric of metrics) {
      const line = `- ${metric.value} ${metric.label}`;
      // A total read without its date would pass for today's figure.
      expect(text).toContain(
        metric.asOf ? `${line} (as of ${metric.asOf})\n` : `${line}\n`,
      );
    }
    expect(metrics.filter((metric) => metric.asOf)).toHaveLength(2);
  });

  it("prints the note that explains a concurrent role, and the availability", async () => {
    const { buildLlmsFull } = await import("./llmsFull");
    const { RESUME_TIMELINE_FALLBACK } =
      await import("@/lib/content/resumeTimeline.fallback");
    const { OPEN_TO_ROLES } = await import("@/lib/content/availability");
    const text = buildLlmsFull();
    const notes = RESUME_TIMELINE_FALLBACK.flatMap((s) => s.items)
      .map((item) => item.note)
      .filter((note): note is string => Boolean(note));
    expect(notes.length).toBeGreaterThan(0);
    for (const note of notes) expect(text).toContain(`  - ${note}`);
    expect(text).toContain(`Availability: ${OPEN_TO_ROLES.sentence}`);
  });
});

describe("operating-model.md", () => {
  it("lists every stage, its skills with links and how to adopt it", async () => {
    const { buildOperatingModelMd } = await import("./operatingModelMd");
    const { operatingModel } = await import("@/lib/content/operatingModel");
    const md = buildOperatingModelMd();
    for (const stage of operatingModel.stages) {
      expect(md).toContain(`. ${stage.label}`);
      expect(md).toContain(stage.principle);
      for (const slug of stage.skills) expect(md).toContain(`/skills/${slug})`);
    }
    expect(md).toContain("## Use it in another project");
  });
});
