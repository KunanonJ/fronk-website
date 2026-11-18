import { describe, expect, it } from "vitest";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { getAllVentures } from "@/lib/content/ventures";
import {
  isNamedMeta,
  type HeadMeta,
  type HeadTags,
} from "@/lib/seo/metadataToHead";
import { siteConfig } from "@/lib/site";
import { projectCaseHead, ventureCaseHead } from "@/src/lib/caseHead";

/*
 * The case pages' heads (profile redesign Phase 5): caseHead.ts builds what
 * the live routes build, and the hidden previews carry that head with only
 * `robots` changed, so their canonical, og:url and og:image (and Share, which
 * copies the canonical) name the live page. These go through the routes'
 * own loaders, so rewiring either route fails here.
 */

const { Route: liveProject } =
  await import("@/src/routes/_landing/portfolio/$slug");
const { Route: liveVenture } =
  await import("@/src/routes/_landing/ventures/$slug");
const { Route: previewProject } =
  await import("@/src/routes/preview/portfolio/$slug");
const { Route: previewVenture } =
  await import("@/src/routes/preview/ventures/$slug");

type Loader = (ctx: {
  params: { slug: string };
}) => { head: HeadTags } | Promise<{ head: HeadTags }>;

async function headOf(route: unknown, slug: string): Promise<HeadTags> {
  const { loader } = (route as { options: { loader: Loader } }).options;
  return (await loader({ params: { slug } })).head;
}

const robots = (head: HeadTags) =>
  head.meta.find((meta) => isNamedMeta(meta, "robots"))?.content;

/** The head without its robots tag. */
const unranked = (head: HeadTags): HeadTags => ({
  ...head,
  meta: head.meta.filter((meta) => !isNamedMeta(meta, "robots")),
});

/** A page's live address: the site's origin, as the build sets it. */
const liveUrl = (path: string) => `${siteConfig.url.replace(/\/$/, "")}${path}`;

const canonical = (head: HeadTags) =>
  head.links.find((link) => link.rel === "canonical")?.href;

const property = (head: HeadTags, name: string) =>
  head.meta.find(
    (meta): meta is Extract<HeadMeta, { property: string }> =>
      "property" in meta && meta.property === name,
  )?.content;

describe("a case page's head", () => {
  for (const project of getAllPortfolioProjects()) {
    it(`/portfolio/${project.slug}: the live route's, and the preview's differs only in robots`, async () => {
      const live = await headOf(liveProject, project.slug);
      const preview = await headOf(previewProject, project.slug);
      expect(projectCaseHead(project)).toEqual(live);
      expect(unranked(preview)).toEqual(unranked(live));
      expect(robots(preview)).toBe("noindex, nofollow");
      expect(robots(live) ?? "").not.toMatch(/noindex|nofollow/);
      const url = liveUrl(`/portfolio/${project.slug}`);
      expect(canonical(preview)).toBe(url);
      expect(property(preview, "og:url")).toBe(url);
      expect(property(preview, "og:image")).toBe(`${url}/opengraph-image`);
    });
  }

  for (const venture of getAllVentures().filter((v) => v.caseStudy)) {
    it(`/ventures/${venture.slug}: the live route's, and the preview's differs only in robots`, async () => {
      const live = await headOf(liveVenture, venture.slug);
      const preview = await headOf(previewVenture, venture.slug);
      expect(ventureCaseHead(venture)).toEqual(live);
      expect(unranked(preview)).toEqual(unranked(live));
      expect(robots(preview)).toBe("noindex, nofollow");
      const url = liveUrl(`/ventures/${venture.slug}`);
      expect(canonical(preview)).toBe(url);
      expect(property(preview, "og:url")).toBe(url);
      expect(property(preview, "og:image")).toBe(`${url}/opengraph-image`);
    });
  }
});
