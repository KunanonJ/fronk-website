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
 * The case pages' heads (profile redesign Phase 5; the live routes build
 * them with caseHead.ts since the Phase 6 cutover, and the hidden previews
 * that compared themselves with them are gone): each route's own loader
 * returns caseHead.ts's head, indexable, whose canonical, og:url and
 * og:image (and Share, which copies the canonical) name the live page. These
 * go through the routes' own loaders, so rewiring either route fails here.
 */

const { Route: liveProject } =
  await import("@/src/routes/_landing/portfolio/$slug");
const { Route: liveVenture } =
  await import("@/src/routes/_landing/ventures/$slug");

type Loader = (ctx: {
  params: { slug: string };
}) => { head: HeadTags } | Promise<{ head: HeadTags }>;

async function headOf(route: unknown, slug: string): Promise<HeadTags> {
  const { loader } = (route as { options: { loader: Loader } }).options;
  return (await loader({ params: { slug } })).head;
}

const robots = (head: HeadTags) =>
  head.meta.find((meta) => isNamedMeta(meta, "robots"))?.content;

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
    it(`/portfolio/${project.slug}: the live route's, indexable, naming the live page`, async () => {
      const live = await headOf(liveProject, project.slug);
      expect(projectCaseHead(project)).toEqual(live);
      expect(robots(live) ?? "").not.toMatch(/noindex|nofollow/);
      const url = liveUrl(`/portfolio/${project.slug}`);
      expect(canonical(live)).toBe(url);
      expect(property(live, "og:url")).toBe(url);
      expect(property(live, "og:image")).toBe(`${url}/opengraph-image`);
    });
  }

  for (const venture of getAllVentures().filter((v) => v.caseStudy)) {
    it(`/ventures/${venture.slug}: the live route's, indexable, naming the live page`, async () => {
      const live = await headOf(liveVenture, venture.slug);
      expect(ventureCaseHead(venture)).toEqual(live);
      expect(robots(live) ?? "").not.toMatch(/noindex|nofollow/);
      const url = liveUrl(`/ventures/${venture.slug}`);
      expect(canonical(live)).toBe(url);
      expect(property(live, "og:url")).toBe(url);
      expect(property(live, "og:image")).toBe(`${url}/opengraph-image`);
    });
  }
});
