import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_OG_IMAGE, routeShareMeta } from "./routeMeta";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";

describe("routeShareMeta", () => {
  it("sets matching canonical, openGraph.url, and twitter title for the route", () => {
    const meta = routeShareMeta({
      title: "About",
      description: "Founder story from Bangkok.",
      path: "/about",
    });

    expect(meta.alternates?.canonical).toBe("/about");
    expect(meta.openGraph?.url).toContain("/about");
    expect(meta.openGraph?.title).toBe("About");
    expect(meta.twitter?.title).toBe("About");
    expect(meta.description).toBe("Founder story from Bangkok.");
  });

  it("advertises the RSS feed only while the blog is public (page alternates replace the layout's)", () => {
    const meta = routeShareMeta({
      title: "Blog",
      description: "Notes",
      path: "/blog",
    });
    if (BLOG_PUBLIC) {
      expect(meta.alternates?.types).toEqual({
        "application/rss+xml": "/feed.xml",
      });
    } else {
      expect(meta.alternates?.types).toBeUndefined();
    }
  });

  it("advertises a page's Markdown twin as text/markdown", () => {
    const meta = routeShareMeta({
      title: "About",
      description: "Bio",
      path: "/about",
      markdownPath: "/about.md",
    });
    expect(meta.alternates?.types).toEqual({
      ...(BLOG_PUBLIC ? { "application/rss+xml": "/feed.xml" } : {}),
      "text/markdown": "/about.md",
    });
  });

  it("defaults og:locale to en_US and lets Thai routes pass th_TH", () => {
    const en = routeShareMeta({ title: "A", description: "B", path: "/about" });
    const th = routeShareMeta({
      title: "A",
      description: "B",
      path: "/th/topics/x",
      locale: "th_TH",
    });
    expect(en.openGraph?.locale).toBe("en_US");
    expect(th.openGraph?.locale).toBe("th_TH");
  });

  it("supports article type with publishedTime", () => {
    const meta = routeShareMeta({
      title: "Shipping from Bangkok",
      description: "Notes",
      path: "/blog/shipping-from-bangkok",
      type: "article",
      publishedTime: "2026-06-12",
      images: ["https://example.com/a.jpg"],
    });

    const og = meta.openGraph as {
      type?: string;
      publishedTime?: string;
    };
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-06-12");
  });

  it("falls back to the site share card when no images are passed", () => {
    // Regression: a page-level openGraph object replaces the inherited one, so
    // without this default /, /about, /blog, ... shipped no og:image at all.
    const meta = routeShareMeta({
      title: "About",
      description: "Founder story from Bangkok.",
      path: "/about",
    });

    expect(meta.openGraph?.images).toEqual([DEFAULT_OG_IMAGE]);
    expect(DEFAULT_OG_IMAGE).toMatchObject({
      url: "/opengraph-image",
      width: 1200,
      height: 630,
    });
    // Left unset so Next.js inherits the route's resolved openGraph images,
    // which keeps per-route opengraph-image files (ventures, topics) intact.
    expect(meta.twitter?.images).toBeUndefined();
  });

  it("uses explicit images for both openGraph and twitter", () => {
    const meta = routeShareMeta({
      title: "Post",
      description: "Notes",
      path: "/blog/post",
      images: ["https://example.com/banner.jpg"],
    });

    expect(meta.openGraph?.images).toEqual([
      { url: "https://example.com/banner.jpg" },
    ]);
    expect(meta.twitter?.images).toEqual(["https://example.com/banner.jpg"]);
  });

  it("skips the site default for routes that ship their own opengraph-image", () => {
    const meta = routeShareMeta({
      title: "GoGoCash",
      description: "Case study",
      path: "/ventures/gogocash",
      hasOwnOgImage: true,
    });

    expect(meta.openGraph?.images).toBeUndefined();
    expect(meta.twitter?.images).toBeUndefined();
  });

  it("is told about every route that serves its own OG image file", () => {
    // A config-based openGraph.images would replace the route's own OG image
    // (src/server/og), so those routes must opt out of the default.
    const routesDir = join(process.cwd(), "src/routes");
    const routes = readdirSync(routesDir, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => join(routesDir, file))
      .filter((file) => readFileSync(file, "utf8").includes("fileOg("));

    expect(routes.length).toBeGreaterThan(0);
    for (const file of routes) {
      const source = readFileSync(file, "utf8");
      if (source.includes("routeShareMeta("))
        expect(source, file).toContain("hasOwnOgImage: true");
    }
  });

  it("includes hreflang languages when provided", () => {
    const meta = routeShareMeta({
      title: "AI transformation Thailand",
      description: "Hub",
      path: "/topics/ai-transformation-thailand",
      languages: {
        en: "/topics/ai-transformation-thailand",
        th: "/th/topics/ai-transformation-thailand",
        "x-default": "/topics/ai-transformation-thailand",
      },
    });
    expect(meta.alternates?.languages).toMatchObject({
      en: "/topics/ai-transformation-thailand",
      th: "/th/topics/ai-transformation-thailand",
    });
  });
});
