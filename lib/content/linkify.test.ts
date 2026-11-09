import { describe, expect, it } from "vitest";
import { FALLBACK_BLOG_POSTS } from "@/lib/content/blog";
import { linkifyInternalPaths } from "@/lib/content/linkify";
import { TOPIC_SLUGS } from "@/lib/content/topics/pillars";
import { getVentureBySlug } from "@/lib/content/ventures";

function links(text: string): string[] {
  return linkifyInternalPaths(text)
    .filter((s) => s.type === "link")
    .map((s) => (s.type === "link" ? s.href : ""));
}

describe("linkifyInternalPaths", () => {
  it("links a path and leaves trailing punctuation as text", () => {
    expect(linkifyInternalPaths("Case hub: /ventures/manut.")).toEqual([
      { type: "text", text: "Case hub: " },
      { type: "link", text: "/ventures/manut", href: "/ventures/manut" },
      { type: "text", text: "." },
    ]);
  });

  it("finds several paths in one paragraph", () => {
    expect(
      links(
        "Hubs: /topics/erp-crm-internal-systems and /topics/ai-transformation-thailand. Product surface: /ventures/manut.",
      ),
    ).toEqual([
      "/topics/erp-crm-internal-systems",
      "/topics/ai-transformation-thailand",
      "/ventures/manut",
    ]);
  });

  it("handles /about, /blog/<slug> and a path at the very start", () => {
    expect(links("About how I work: /about.")).toEqual(["/about"]);
    expect(links("/blog/cashback-loops is related.")).toEqual([
      "/blog/cashback-loops",
    ]);
  });

  it("ignores URLs, slashed words and unknown or partial paths", () => {
    expect(links("See https://kunanonj.com/topics/x for more.")).toEqual([]);
    expect(links("AR/AP, withholding tax and P/L.")).toEqual([]);
    expect(links("Go to /about-me or /topics/ or /contact.")).toEqual([]);
  });

  it("returns the text untouched when nothing matches", () => {
    expect(linkifyInternalPaths("No links here.")).toEqual([
      { type: "text", text: "No links here." },
    ]);
  });
});

describe("fallback blog posts", () => {
  const blogSlugs = new Set(FALLBACK_BLOG_POSTS.map((p) => p.slug));
  const topicSlugs = new Set<string>(TOPIC_SLUGS);

  function resolves(href: string): boolean {
    if (href === "/about") return true;
    const [, section, slug] = href.split("/");
    if (section === "topics") return topicSlugs.has(slug ?? "");
    if (section === "ventures")
      return Boolean(getVentureBySlug(slug ?? "")?.caseStudy);
    if (section === "blog") return blogSlugs.has(slug ?? "");
    return false;
  }

  it("link only to pages that exist", () => {
    const hrefs = FALLBACK_BLOG_POSTS.flatMap((post) =>
      (post.bodyParagraphs ?? []).flatMap(links),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(resolves(href), href).toBe(true);
    }
  });
});
