import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

// The reference was crawled from a production-URL build; siteConfig reads this at import.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://kunanonj.com";
});
import { metadata as aboutMetadata } from "@/app/(landing)/about/page";
import { metadata as homeMetadata } from "@/app/(landing)/page";
import { headTags } from "@/lib/parity/parity.mjs";
import { headToHtml, metadataToHead, rootHead } from "@/lib/seo/metadataToHead";
import { rootMetadata, rootViewport } from "@/lib/seo/rootMetadata";

const reference = JSON.parse(
  readFileSync(
    join(process.cwd(), "process/features/tanstack-migration/references/next-parity_09-11-26.json"),
    "utf8",
  ),
) as Record<string, { title: string; tags: string[] }>;

function render(page: Parameters<typeof metadataToHead>[1]) {
  const head = metadataToHead(rootMetadata, page);
  const html = headToHtml(rootHead(rootViewport), head);
  const title = head.meta.find((m) => "title" in m)?.title;
  return { title, tags: headTags(html) };
}

describe("metadataToHead (parity with the Next build)", () => {
  it.each([
    ["/", homeMetadata],
    ["/about", aboutMetadata],
  ])("reproduces every head tag Next ships on %s", (path, page) => {
    const { title, tags } = render(page);
    expect(title).toBe(reference[path]!.title);
    expect(tags).toEqual(reference[path]!.tags);
  });

  it("applies the root title template and noindex robots", () => {
    const head = metadataToHead(rootMetadata, { title: "Resume", robots: { index: false, follow: false } });
    expect(head.meta).toContainEqual({ title: "Resume — Fronk Kunanon Jarat" });
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex, nofollow" });
  });

  it("uses the segment's file image when the page has no config image", () => {
    const head = metadataToHead(
      rootMetadata,
      { openGraph: { title: "X" }, twitter: { card: "summary_large_image" } },
      { fileOgImage: { url: "/x/opengraph-image", width: 1200, height: 630, alt: "X", type: "image/png" } },
    );
    expect(head.meta).toContainEqual({ property: "og:image", content: "https://kunanonj.com/x/opengraph-image" });
    expect(head.meta).toContainEqual({ name: "twitter:image:type", content: "image/png" });
  });
});
