import { describe, expect, it } from "vitest";
import { SITE_UPDATED } from "@/lib/content/freshness";
import { OPEN_TO_ROLES, PERSON_SUMMARY } from "@/lib/content/identity";
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
      "- IT Manager & AI Engineering Lead, The Binary Holdings (Nov 2025 to Present)",
    );
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
});
