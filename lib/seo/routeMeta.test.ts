import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_OG_IMAGE, routeShareMeta } from "./routeMeta";

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

  it("is told about every route segment with its own opengraph-image file", () => {
    // In Next.js 16.4 a config-based openGraph.images replaces a segment's
    // opengraph-image file, so those pages must opt out of the default.
    const appDir = join(process.cwd(), "app");
    const segments = readdirSync(appDir, { recursive: true, encoding: "utf8" })
      .filter((file) => /(^|\/)opengraph-image\.tsx$/.test(file))
      .map((file) => join(appDir, file, ".."))
      .filter((dir) => dir !== appDir);

    expect(segments.length).toBeGreaterThan(0);
    for (const dir of segments) {
      const page = join(dir, "page.tsx");
      if (!existsSync(page)) continue;
      const source = readFileSync(page, "utf8");
      if (source.includes("routeShareMeta(")) {
        expect(source, page).toContain("hasOwnOgImage: true");
      }
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
