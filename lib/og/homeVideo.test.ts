import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

// Heads are absolute on the site's origin, as production builds them.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://kunanonj.com";
});
import { getAllPortfolioSlugs } from "@/lib/content/portfolio";
import { getAllSkillSlugs } from "@/lib/content/skills";
import { TOPIC_SLUGS } from "@/lib/content/topics/pillars";
import { getAllVentures } from "@/lib/content/ventures";
import { OG_SIZE } from "@/lib/og/card";
import record from "@/lib/og/homeVideo.json";
import { HOME_VIDEO_MAX_BYTES } from "@/lib/og/homeVideoFrames";
import type { HeadMeta, HeadTags } from "@/lib/seo/metadataToHead";

/*
 * Home's og:video (lib/og/homeVideo.ts): the committed file, Home's tags,
 * and no tag on any other page (Messages would show Home's card for it).
 */

const root = process.cwd();
const file = readFileSync(join(root, "public", record.src));

/** The MP4's top-level boxes, in order. */
function boxes(bytes: Buffer): string[] {
  const types: string[] = [];
  for (let at = 0; at + 8 <= bytes.length;) {
    const size = bytes.readUInt32BE(at);
    types.push(bytes.toString("latin1", at + 4, at + 8));
    if (size < 8) break;
    at += size;
  }
  return types;
}

const video = (head: HeadTags) =>
  head.meta.filter(
    (m): m is Extract<HeadMeta, { property: string }> =>
      "property" in m && m.property.startsWith("og:video"),
  );

describe("Home's og:video file", () => {
  it("is the file the record names, named by its content", () => {
    const hash = createHash("sha256").update(file).digest("hex");
    expect(hash).toBe(record.sha256);
    expect(record.src).toBe(`/og/home-${hash.slice(0, 8)}.mp4`);
    expect(file.length).toBe(record.bytes);
    // The script removes the video it replaces.
    expect(readdirSync(join(root, "public/og"))).toEqual([
      record.src.slice("/og/".length),
    ]);
  });

  it("is an MP4 under 2 MB with its index before its media (+faststart)", () => {
    expect(file.toString("latin1", 4, 8)).toBe("ftyp");
    expect(file.length).toBeLessThan(HOME_VIDEO_MAX_BYTES);
    const order = boxes(file);
    expect(order[0]).toBe("ftyp");
    expect(order).toContain("moov");
    expect(order.indexOf("moov")).toBeLessThan(order.indexOf("mdat"));
  });
});

describe("Home's head", () => {
  it("names the video by its https URL on the site, with its type and size", async () => {
    const { Route } = await import("@/src/routes/_landing/index");
    const head = Route.options.head!({} as never) as unknown as HeadTags;
    const url = `https://kunanonj.com${record.src}`;
    expect(video(head)).toEqual([
      { property: "og:video", content: url },
      { property: "og:video:secure_url", content: url },
      { property: "og:video:type", content: "video/mp4" },
      { property: "og:video:width", content: String(OG_SIZE.width) },
      { property: "og:video:height", content: String(OG_SIZE.height) },
    ]);
    // The still stays for every app that shows one: the video's first frame.
    expect(head.meta).toContainEqual({
      property: "og:image",
      content: "https://kunanonj.com/opengraph-image",
    });
    expect(head.meta).toContainEqual({
      name: "twitter:image",
      content: "https://kunanonj.com/opengraph-image",
    });
  });
});

describe("every other page's head", () => {
  type RouteModule = {
    Route?: {
      options: {
        head?: (ctx: unknown) => Partial<HeadTags> | Promise<Partial<HeadTags>>;
        loader?: (ctx: unknown) => unknown;
      };
    };
  };
  const routes = import.meta.glob<RouteModule>("/src/routes/**/*.{ts,tsx}", {
    eager: true,
  });
  const HOME = "/src/routes/_landing/index.tsx";

  const headOf = async (mod: RouteModule, loaderData?: unknown) =>
    ((await mod.Route?.options.head?.({ loaderData })) ?? {}) as HeadTags;

  it("has no og:video on a page with a head of its own", async () => {
    const withHeads = Object.entries(routes).filter(
      ([, mod]) => mod.Route?.options.head,
    );
    expect(withHeads.length).toBeGreaterThan(20);
    for (const [path, mod] of withHeads) {
      const head = await headOf(mod);
      expect(video({ meta: head.meta ?? [], links: [] }), path).toEqual(
        path === HOME ? expect.any(Array) : [],
      );
    }
  });

  it("has no og:video on a case, a skill or a topic page", async () => {
    const pages: [string, string[]][] = [
      ["_landing/portfolio/$slug.tsx", [...getAllPortfolioSlugs()]],
      ["_landing/ventures/$slug.tsx", getAllVentures().map((v) => v.slug)],
      ["_landing/skills/$slug.tsx", getAllSkillSlugs()],
      ["_landing/topics/$slug.tsx", [...TOPIC_SLUGS]],
      ["_landing/th/topics/$slug.tsx", [...TOPIC_SLUGS]],
    ];
    for (const [route, slugs] of pages) {
      const mod = routes[`/src/routes/${route}`]!;
      expect(slugs.length, route).toBeGreaterThan(0);
      for (const slug of slugs) {
        const data = await mod.Route!.options.loader!({ params: { slug } });
        const head = await headOf(mod, data);
        expect(head.meta?.length, `${route} ${slug}`).toBeGreaterThan(0);
        expect(video(head), `${route} ${slug}`).toEqual([]);
      }
    }
  });
});
