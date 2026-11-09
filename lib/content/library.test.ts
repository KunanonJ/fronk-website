import { describe, expect, it } from "vitest";
import { FALLBACK_BLOG_POSTS } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import {
  BUILD_VENTURES,
  buildBoard,
  buildColumns,
} from "@/lib/content/buildBoard";
import { EXAMPLE_PERSONAS, examplesByPersona } from "@/lib/content/examples";
import {
  getLearnHubs,
  getLearnWritingLinks,
  learnOperatorNotes,
} from "@/lib/content/learn";
import { getProofCases, getProofMetrics } from "@/lib/content/proof";
import {
  STACK_GROUPS,
  stackItems,
  stackItemsByGroup,
  stackPage,
} from "@/lib/content/stack";
import { TOPIC_SLUGS, getTopicPillar } from "@/lib/content/topics/pillars";
import { footerLibrary, primaryNav } from "@/lib/content/landing";
import {
  BUILD_VENTURE_IDS,
  EXAMPLE_PERSONA_IDS,
  STACK_GROUP_IDS,
} from "@/lib/library/search";

/** The h1 lines and accent joined, as the visible heading reads. */
function headlineText(headline: {
  lines: readonly (readonly (string | { muted: string })[])[];
  accent: string;
}): string {
  const lines = headline.lines.map((line) =>
    line.map((s) => (typeof s === "string" ? s : s.muted)).join(""),
  );
  return [...lines, headline.accent].join(" ").replace(/\s+/g, " ");
}

describe("stack content", () => {
  it("has items in every group with https websites and a badge", () => {
    for (const group of STACK_GROUPS) {
      expect(stackItemsByGroup(group.id).length).toBeGreaterThan(0);
    }
    for (const item of stackItems) {
      expect(item.website).toMatch(/^https?:\/\//);
      expect(item.purpose.length).toBeGreaterThan(0);
      expect(item.badge, item.name).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("files every tool under a group the ?group= param knows", () => {
    expect(STACK_GROUPS.map((g) => g.id)).toEqual([...STACK_GROUP_IDS]);
    const grouped = STACK_GROUPS.flatMap((g) => stackItemsByGroup(g.id));
    expect(grouped).toHaveLength(stackItems.length);
  });

  it("leads the through-line with a listed tool", () => {
    expect(stackItems.map((i) => i.name)).toContain(stackPage.throughLine);
  });

  it("draws the h1 from the description, word for word", () => {
    expect(stackPage.description).toContain("not a wishlist");
    expect(headlineText(stackPage.headline)).toBe(
      "Tools evidenced in public GitHub, not a wishlist. TypeScript is the through-line.",
    );
  });
});

describe("learn content", () => {
  it("lists every topic hub in English and Thai", () => {
    for (const lang of ["en", "th"] as const) {
      const hubs = getLearnHubs(lang);
      expect(hubs.map((h) => h.slug)).toEqual([...TOPIC_SLUGS]);
      for (const hub of hubs) {
        const pillar = getTopicPillar(hub.slug, lang);
        expect(hub.title).toBe(pillar?.h1);
        expect(hub.lede).toBe(pillar?.lede);
        expect(hub.lang).toBe(lang);
      }
    }
  });

  it("links each hub in its language and the other", () => {
    const [en] = getLearnHubs("en");
    expect(en.href).toBe(`/topics/${en.slug}`);
    expect(en.alt).toMatchObject({ lang: "th", href: `/th/topics/${en.slug}` });
    const [th] = getLearnHubs("th");
    expect(th.href).toBe(`/th/topics/${th.slug}`);
    expect(th.alt).toMatchObject({ lang: "en", href: `/topics/${th.slug}` });
  });

  it("links operator notes into /about and posts only while the blog is public", () => {
    expect(learnOperatorNotes.every((n) => n.href.startsWith("/about#"))).toBe(
      true,
    );
    const writing = getLearnWritingLinks(FALLBACK_BLOG_POSTS);
    if (BLOG_PUBLIC) expect(writing.length).toBeGreaterThan(0);
    else expect(writing).toHaveLength(0);
  });
});

describe("proof content", () => {
  it("quotes the published sentence behind every metric", () => {
    const metrics = getProofMetrics();
    expect(metrics.length).toBeGreaterThan(0);
    for (const metric of metrics) {
      expect(metric.quote, metric.label).toContain(metric.value);
      expect(metric.href).toMatch(/^\/ventures\//);
    }
  });

  it("finds each GoGoCash figure where the canvas cites it", () => {
    const where = Object.fromEntries(
      getProofMetrics().map((m) => [m.label, m.where]),
    );
    expect(where).toEqual({
      Users: "GoGoCash case · Where it stands",
      Merchants: "GoGoCash · Venture summary",
      "Max cashback": "GoGoCash case · What it is",
    });
  });

  it("shows only ventures with a case page, no press items", () => {
    const cases = getProofCases();
    expect(cases.length).toBeGreaterThan(0);
    for (const venture of cases) expect(venture.caseStudy).toBeDefined();
  });
});

describe("build board", () => {
  it("keeps thin column caps", () => {
    expect(buildColumns).toHaveLength(3);
    expect(buildBoard.next.length).toBeLessThanOrEqual(3);
    expect(buildBoard.inProgress.length).toBeLessThanOrEqual(2);
    expect(buildBoard.shipped.length).toBeLessThanOrEqual(6);
    expect(buildBoard.shipped.length).toBeGreaterThan(0);
  });

  it("tags every ticket with a venture the ?venture= param knows", () => {
    expect(BUILD_VENTURES.map((v) => v.id)).toEqual([...BUILD_VENTURE_IDS]);
    for (const column of buildColumns) {
      for (const ticket of buildBoard[column.id]) {
        expect(BUILD_VENTURE_IDS, ticket.id).toContain(ticket.venture);
      }
    }
  });

  it("no longer describes the retired pre-bento chrome", () => {
    const text = buildColumns
      .flatMap((c) => buildBoard[c.id])
      .map((t) => `${t.title} ${t.body}`)
      .join(" ");
    expect(text).not.toMatch(/pill nav|keyword tips|cinematic|Prisma-style/i);
  });
});

describe("examples content", () => {
  it("covers builders, operators, and founders", () => {
    expect(EXAMPLE_PERSONAS.map((p) => p.id)).toEqual([...EXAMPLE_PERSONA_IDS]);
    for (const persona of EXAMPLE_PERSONAS) {
      expect(examplesByPersona[persona.id].length).toBeGreaterThan(0);
    }
  });

  it("never links the hidden blog or press pages", () => {
    for (const persona of EXAMPLE_PERSONAS) {
      for (const card of examplesByPersona[persona.id]) {
        expect(card.href, card.title).not.toMatch(/^\/(blog|press)(\/|$)/);
      }
    }
  });
});

describe("footer library", () => {
  it("links the five library routes", () => {
    const hrefs = footerLibrary.map((l) => l.href);
    expect(hrefs).toEqual([
      "/learn",
      "/examples",
      "/stack",
      "/proof",
      "/build",
    ]);
  });

  it("exposes the same links under the Library nav menu", () => {
    const library = primaryNav.find(
      (item) => item.type === "menu" && item.label === "Library",
    );
    expect(library?.type).toBe("menu");
    if (library?.type !== "menu") return;
    expect(library.children.map((c) => c.href)).toEqual(
      footerLibrary.map((l) => l.href),
    );
  });
});
