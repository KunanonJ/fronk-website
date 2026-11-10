import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

// The reference was crawled from a production-URL build; siteConfig reads this at import.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://kunanonj.com";
});
import { headTags } from "@/lib/parity/parity.mjs";
import { headToHtml, metadataToHead, rootHead } from "@/lib/seo/metadataToHead";
import { rootMetadata, rootViewport } from "@/lib/seo/rootMetadata";
import { Route as AboutRoute } from "@/src/routes/_landing/about";
import { Route as HomeRoute } from "@/src/routes/_landing/index";

const reference = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/site-parity.json"), "utf8"),
) as Record<string, { title: string; tags: string[] }>;

describe("metadataToHead (matches the site reference)", () => {
  it.each([
    ["/", HomeRoute],
    ["/about", AboutRoute],
  ])(
    "the route head() reproduces every head tag in the reference for %s",
    (path, route) => {
      const head = route.options.head!({} as never) as unknown as ReturnType<
        typeof metadataToHead
      >;
      const html = headToHtml(rootHead(rootViewport), head);
      const title = head.meta.find((m) => "title" in m)?.title;
      const tags = headTags(html);
      expect(title).toBe(reference[path]!.title);
      expect(tags).toEqual(reference[path]!.tags);
    },
  );

  it("applies the root title template and noindex robots", () => {
    const head = metadataToHead(rootMetadata, {
      title: "Resume",
      robots: { index: false, follow: false },
    });
    expect(head.meta).toContainEqual({ title: "Resume — Fronk Kunanon Jarat" });
    expect(head.meta).toContainEqual({
      name: "robots",
      content: "noindex, nofollow",
    });
  });

  it("uses the segment's file image when the page has no config image", () => {
    const head = metadataToHead(
      rootMetadata,
      { openGraph: { title: "X" }, twitter: { card: "summary_large_image" } },
      {
        fileOgImage: {
          url: "/x/opengraph-image",
          width: 1200,
          height: 630,
          alt: "X",
          type: "image/png",
        },
      },
    );
    expect(head.meta).toContainEqual({
      property: "og:image",
      content: "https://kunanonj.com/x/opengraph-image",
    });
    expect(head.meta).toContainEqual({
      name: "twitter:image:type",
      content: "image/png",
    });
  });
});
