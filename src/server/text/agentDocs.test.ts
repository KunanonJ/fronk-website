import { describe, expect, it } from "vitest";
import { SITE_UPDATED } from "@/lib/content/freshness";
import {
  CURRENT_ROLE,
  OPEN_TO_ROLES,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
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
