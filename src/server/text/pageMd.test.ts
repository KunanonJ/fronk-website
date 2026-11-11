import { describe, expect, it } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { SITE_UPDATED } from "@/lib/content/freshness";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { buildAboutMd, GET as aboutMd } from "./aboutMd";
import { absoluteUrl, SITE_BASE } from "./markdown";
import { buildPortfolioProjectMd, GET as portfolioMd } from "./portfolioMd";

/** Every Markdown link target must be absolute: agents read these out of context. */
function relativeLinks(md: string): string[] {
  return [...md.matchAll(/\]\(([^)]+)\)/g)]
    .map((m) => m[1]!)
    .filter((href) => !/^https?:\/\//.test(href));
}

describe("absoluteUrl", () => {
  it("keeps external links, prefixes site paths and resolves anchors", () => {
    expect(absoluteUrl("https://gogocash.co")).toBe("https://gogocash.co");
    expect(absoluteUrl("/resume")).toBe(`${SITE_BASE}/resume`);
    expect(absoluteUrl("#story", "/about")).toBe(`${SITE_BASE}/about#story`);
  });
});

describe("about.md", () => {
  const md = buildAboutMd();

  it("carries the page in order, dated, with absolute links only", () => {
    expect(md.startsWith("# About Kunanon Jarat (Fronk)")).toBe(true);
    expect(md).toContain(`Updated: ${SITE_UPDATED}`);
    expect(md).toContain(aboutPage.story.whoIs);
    // The availability the page shows in its hero, before the story.
    expect(md.indexOf(OPEN_TO_ROLES.sentence)).toBeGreaterThan(0);
    expect(md.indexOf(OPEN_TO_ROLES.sentence)).toBeLessThan(
      md.indexOf(`## ${aboutPage.story.heading}`),
    );
    const order = [
      aboutPage.story.heading,
      aboutPage.path.heading,
      aboutPage.principles.heading,
      aboutPage.now.heading,
      aboutPage.stack.heading,
      aboutPage.faq.heading,
      aboutPage.cta.heading,
    ].map((h) => md.indexOf(`## ${h}`));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(relativeLinks(md)).toEqual([]);
  });

  it("includes every principle and FAQ answer", () => {
    for (const item of aboutPage.principles.items)
      expect(md).toContain(item.title);
    for (const f of FAQ_ITEMS) expect(md).toContain(f.answer);
  });

  it("never links legacy /writing, and links /blog only while it is public", () => {
    expect(md).not.toContain("/writing");
    if (BLOG_PUBLIC) expect(md).toContain(`${SITE_BASE}/blog`);
    else expect(md).not.toContain(`${SITE_BASE}/blog`);
  });

  it("is served as Markdown", () => {
    const res = aboutMd();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
  });
});

describe("portfolio/<slug>.md", () => {
  it("renders every project with its sections and absolute links", () => {
    for (const project of getAllPortfolioProjects()) {
      const md = buildPortfolioProjectMd(project);
      expect(md.startsWith(`# ${project.name}`)).toBe(true);
      expect(md).toContain(`Source: ${SITE_BASE}/portfolio/${project.slug}`);
      expect(md).toContain(project.summary);
      for (const s of project.sections) expect(md).toContain(`## ${s.heading}`);
      expect(relativeLinks(md)).toEqual([]);
    }
  });

  it("states the outcomes and his part before the highlights, as the page does", () => {
    for (const project of getAllPortfolioProjects()) {
      const md = buildPortfolioProjectMd(project);
      const outcomes = project.outcomes ?? [];
      const headings = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
      const lead = [
        ...(outcomes.length > 0 ? ["Outcome"] : []),
        ...(project.myPart ? ["My part"] : []),
        "Highlights",
      ];
      expect(headings.slice(0, lead.length), project.slug).toEqual(lead);
      for (const outcome of outcomes)
        expect(md).toContain(`- **${outcome.label}:** ${outcome.value}`);
      // The figures are his own statement: the twin names where they are.
      expect(md.includes(`As stated in the résumé: ${SITE_BASE}/resume`)).toBe(
        outcomes.length > 0,
      );
      expect(md.includes("## My part")).toBe(Boolean(project.myPart));
      expect(md).toContain(project.myPart ?? "");
    }
    // The audit in portfolioOutcomes.test.ts needs both kinds of project.
    const withOutcomes = getAllPortfolioProjects().filter(
      (project) => project.outcomes?.length,
    );
    expect(withOutcomes.length).toBeGreaterThan(0);
    expect(withOutcomes.length).toBeLessThan(getAllPortfolioProjects().length);
  });

  it("labels a public project's link as the project does, and says an internal tool has no public link", () => {
    for (const project of getAllPortfolioProjects()) {
      const md = buildPortfolioProjectMd(project);
      const open = project.access === "public";
      expect(md.includes("Access: internal tool (no public link)")).toBe(!open);
      // This site links its source: "Live" would point a reader at GitHub.
      expect(md.includes(`${project.urlLabel}: ${project.url}  `)).toBe(open);
      expect(md).not.toMatch(/^Live: https:\/\/github\.com/m);
    }
    expect(
      buildPortfolioProjectMd(
        getAllPortfolioProjects().find((p) => p.slug === "kunanonj-com")!,
      ),
    ).toContain(
      "Source on GitHub: https://github.com/KunanonJ/fronk-website  ",
    );
  });

  it("answers an unknown slug with a 404", async () => {
    const res = portfolioMd("not-a-project");
    expect(res.status).toBe(404);
    expect(await res.text()).toContain("Not found");
  });
});
