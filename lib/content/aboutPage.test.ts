import { describe, expect, it } from "vitest";
import { aboutPage } from "./aboutPage";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";

function flattenSpans(
  paragraphs: readonly { spans: readonly { text: string; href?: string }[] }[],
): string {
  return paragraphs
    .flatMap((p) =>
      p.spans.map((s) =>
        "href" in s && s.href ? `${s.text} ${s.href}` : s.text,
      ),
    )
    .join(" ");
}

describe("aboutPage content", () => {
  it("ships non-empty story, principles, now, path, and CTAs", () => {
    expect(aboutPage.hero.title.length).toBeGreaterThan(0);
    expect(aboutPage.story.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(aboutPage.principles.items.length).toBe(4);
    expect(aboutPage.now.paragraphs.length).toBeGreaterThanOrEqual(1);
    expect(aboutPage.path.chips.length).toBeGreaterThanOrEqual(4);
    expect(aboutPage.cta.links.length).toBeGreaterThanOrEqual(2);
  });

  it("ships a GitHub-grounded tech stack section with icons", () => {
    expect(aboutPage.stack.id).toBe("stack");
    expect(aboutPage.stack.groups.length).toBeGreaterThanOrEqual(3);
    expect(aboutPage.stack.moreHref).toBe("/stack");
    for (const group of aboutPage.stack.groups) {
      expect(group.items.length).toBeGreaterThan(0);
      for (const item of group.items) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.icon.length).toBeGreaterThan(0);
      }
    }
    expect(
      aboutPage.stack.groups.some((g) =>
        g.items.some((i) => i.name === "TypeScript"),
      ),
    ).toBe(true);
  });

  it("anchors Manifesto to the story section", () => {
    expect(aboutPage.hero.manifestoHref).toBe("#story");
    expect(aboutPage.story.id).toBe("story");
  });

  it("never links legacy /writing, and links /blog only while the blog is public", () => {
    const corpus = [
      flattenSpans(aboutPage.story.paragraphs),
      flattenSpans(aboutPage.now.paragraphs),
      aboutPage.path.resumeHref,
      ...aboutPage.cta.links.map((l) => l.href),
    ].join(" ");

    expect(corpus).not.toContain("/writing");
    if (BLOG_PUBLIC) expect(corpus).toContain("/blog");
    else expect(corpus).not.toContain("/blog");
  });

  it("grounds key entities from the real bio", () => {
    const corpus = flattenSpans(aboutPage.story.paragraphs);
    expect(corpus).toContain("GoGoCash");
    expect(corpus).toContain("Manut");
    expect(corpus).toMatch(/Bangkok|Bangkok-based/i);
  });

  it("uses the person's name as the page h1", () => {
    expect(aboutPage.hero.title).toContain("Kunanon Jarat");
  });

  it("describes Manut the same way as the venture hub", () => {
    const corpus = [
      flattenSpans(aboutPage.story.paragraphs),
      aboutPage.story.whoIs,
    ].join(" ");
    expect(corpus).not.toMatch(/solo entrepreneurs/i);
    expect(corpus).toMatch(/ERP\/CRM workspace with Intelligence AI for automotive SMEs/);
  });
});
