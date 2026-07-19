import { describe, expect, it } from "vitest";
import { FALLBACK_BLOG_POSTS } from "@/lib/content/blog";
import { buildBoard, buildColumns } from "@/lib/content/buildBoard";
import {
  EXAMPLE_PERSONAS,
  examplesByPersona,
} from "@/lib/content/examples";
import {
  getLearnTopicLinks,
  getLearnWritingLinks,
  learnOperatorNotes,
} from "@/lib/content/learn";
import { getProofCards, getProofMetrics } from "@/lib/content/proof";
import { STACK_GROUPS, stackItems, stackItemsByGroup } from "@/lib/content/stack";
import { TOPIC_SLUGS } from "@/lib/content/topics/pillars";
import { footerLibrary, primaryNav } from "@/lib/content/landing";

describe("stack content", () => {
  it("has items in every group with https websites", () => {
    for (const group of STACK_GROUPS) {
      expect(stackItemsByGroup(group).length).toBeGreaterThan(0);
    }
    for (const item of stackItems) {
      expect(item.website).toMatch(/^https?:\/\//);
      expect(item.purpose.length).toBeGreaterThan(0);
    }
  });
});

describe("learn content", () => {
  it("lists all EN topic hubs and operator notes", () => {
    const topics = getLearnTopicLinks();
    expect(topics).toHaveLength(TOPIC_SLUGS.length);
    expect(topics.every((t) => t.href.startsWith("/topics/"))).toBe(true);
    expect(learnOperatorNotes.every((n) => n.href.startsWith("/about#"))).toBe(
      true,
    );
    expect(getLearnWritingLinks(FALLBACK_BLOG_POSTS).length).toBeGreaterThan(0);
  });
});

describe("proof content", () => {
  it("exposes venture metrics and proof cards with hrefs", () => {
    expect(getProofMetrics().length).toBeGreaterThan(0);
    const cards = getProofCards();
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.href.length).toBeGreaterThan(0);
    }
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
});

describe("examples content", () => {
  it("covers builders, operators, and founders", () => {
    for (const persona of EXAMPLE_PERSONAS) {
      expect(examplesByPersona[persona].length).toBeGreaterThan(0);
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
