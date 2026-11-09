import type { Metadata, Viewport } from "@/lib/seo/types";
import { IDENTITY_LINKS } from "@/lib/seo/identity";

/*
 * Next.js Metadata -> TanStack Start head() (tanstack-migration Phase 1).
 *
 * Reproduces the parts of Next's metadata resolution this site relies on, so
 * every route keeps the exact tags it ships today (proven by the parity crawl):
 * - title: the root template ("%s — Name"), `absolute`, the root default;
 * - page fields replace root fields wholesale (alternates, openGraph, twitter,
 *   robots), as Next does;
 * - URLs are absolutised against metadataBase, and the site root loses its
 *   trailing slash (trailingSlash: false);
 * - openGraph images: config images, else the segment's file-based image;
 *   Twitter copies the openGraph images when it has none of its own.
 */

export type HeadMeta = Record<string, string>;
export type HeadLink = Record<string, string>;
export type HeadTags = { meta: HeadMeta[]; links: HeadLink[] };

/** A file-based OG image (Next's opengraph-image convention). */
export type FileOgImage = {
  url: string;
  width: number;
  height: number;
  alt?: string;
  type?: string;
};

type OgImage = { url: string | URL; width?: number | string; height?: number | string; alt?: string; type?: string };

function absolute(base: URL | null | undefined, value: string | URL): string {
  const href = new URL(String(value), base ?? undefined).href;
  // Next renders the site root without a trailing slash.
  return href.replace(/^(https?:\/\/[^/]+)\/$/, "$1");
}

function resolveTitle(root: Metadata["title"], page: Metadata["title"]): string | undefined {
  const template = root && typeof root === "object" && "template" in root ? root.template : undefined;
  const rootDefault =
    typeof root === "string" ? root : root && typeof root === "object" && "default" in root ? root.default : undefined;
  if (page == null) return rootDefault ?? undefined;
  if (typeof page === "string") return template ? template.replace("%s", page) : page;
  if ("absolute" in page && page.absolute) return page.absolute;
  if ("default" in page && page.default) return page.default;
  return rootDefault ?? undefined;
}

function robotsContent(robots: Metadata["robots"]): string | undefined {
  if (!robots) return undefined;
  if (typeof robots === "string") return robots;
  const parts: string[] = [];
  if (robots.index !== undefined) parts.push(robots.index ? "index" : "noindex");
  if (robots.follow !== undefined) parts.push(robots.follow ? "follow" : "nofollow");
  if (robots.nocache) parts.push("nocache");
  return parts.join(", ") || undefined;
}

function toList<T>(value: T | readonly T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? [...value] : [value as T];
}

function asImages(images: unknown): OgImage[] {
  return toList(images as OgImage | string | URL).map((img) =>
    typeof img === "string" || img instanceof URL ? { url: img } : img,
  );
}

/** Page head: title, description, canonical/alternates, OG, Twitter, robots. */
export function metadataToHead(
  root: Metadata,
  page: Metadata,
  options: { fileOgImage?: FileOgImage } = {},
): HeadTags {
  const base = (page.metadataBase ?? root.metadataBase) as URL | null | undefined;
  const meta: HeadMeta[] = [];
  const links: HeadLink[] = [];

  const title = resolveTitle(root.title, page.title);
  if (title) meta.push({ title });

  const description = page.description ?? root.description;
  if (description) meta.push({ name: "description", content: description });

  for (const author of toList(page.authors ?? root.authors)) {
    if (!author) continue;
    if (author.name) meta.push({ name: "author", content: author.name });
    if (author.url) links.push({ rel: "author", href: absolute(base, author.url) });
  }
  const creator = page.creator ?? root.creator;
  if (creator) meta.push({ name: "creator", content: creator });

  const robots = robotsContent(page.robots ?? root.robots);
  if (robots) meta.push({ name: "robots", content: robots });

  const google = (page.verification ?? root.verification)?.google;
  for (const value of toList(google)) meta.push({ name: "google-site-verification", content: String(value) });

  const alternates = page.alternates ?? root.alternates;
  if (alternates?.canonical) {
    const canonical = typeof alternates.canonical === "object" && "url" in alternates.canonical
      ? alternates.canonical.url
      : (alternates.canonical as string | URL);
    links.push({ rel: "canonical", href: absolute(base, canonical) });
  }
  for (const [lang, href] of Object.entries(alternates?.languages ?? {})) {
    for (const entry of toList(href as string | { url: string })) {
      const url = typeof entry === "object" ? entry.url : entry;
      links.push({ rel: "alternate", hrefLang: lang, href: absolute(base, url) });
    }
  }
  for (const [type, href] of Object.entries(alternates?.types ?? {})) {
    for (const entry of toList(href as string | { url: string })) {
      const url = typeof entry === "object" ? entry.url : entry;
      links.push({ rel: "alternate", type, href: absolute(base, url) });
    }
  }

  const og = (page.openGraph ?? root.openGraph ?? {}) as Record<string, unknown>;
  const ogImages: OgImage[] = og.images
    ? asImages(og.images)
    : options.fileOgImage
      ? [options.fileOgImage]
      : [];
  const ogPairs: [string, unknown][] = [
    ["og:title", og.title],
    ["og:description", og.description],
    ["og:url", og.url ? absolute(base, og.url as string) : undefined],
    ["og:site_name", og.siteName],
    ["og:locale", og.locale],
  ];
  for (const [property, content] of ogPairs) if (content) meta.push({ property, content: String(content) });
  for (const img of ogImages) {
    meta.push({ property: "og:image", content: absolute(base, img.url) });
    if (img.width) meta.push({ property: "og:image:width", content: String(img.width) });
    if (img.height) meta.push({ property: "og:image:height", content: String(img.height) });
    if (img.alt) meta.push({ property: "og:image:alt", content: img.alt });
    if (img.type) meta.push({ property: "og:image:type", content: img.type });
  }
  if (og.type) meta.push({ property: "og:type", content: String(og.type) });
  if (og.type === "article" && og.publishedTime) {
    meta.push({ property: "article:published_time", content: String(og.publishedTime) });
  }

  const tw = (page.twitter ?? root.twitter ?? {}) as Record<string, unknown>;
  const twImages: OgImage[] = tw.images ? asImages(tw.images) : ogImages;
  const twPairs: [string, unknown][] = [
    ["twitter:card", tw.card],
    ["twitter:site", tw.site],
    ["twitter:creator", tw.creator],
    ["twitter:title", tw.title],
    ["twitter:description", tw.description],
  ];
  for (const [name, content] of twPairs) if (content) meta.push({ name, content: String(content) });
  for (const img of twImages) {
    meta.push({ name: "twitter:image", content: absolute(base, img.url) });
    if (img.width) meta.push({ name: "twitter:image:width", content: String(img.width) });
    if (img.height) meta.push({ name: "twitter:image:height", content: String(img.height) });
    if (img.alt) meta.push({ name: "twitter:image:alt", content: img.alt });
    if (img.type) meta.push({ name: "twitter:image:type", content: img.type });
  }

  return { meta, links };
}

/** Next's viewport meta content: the four fields this site sets, in Next's order. */
export function viewportContent(viewport: Viewport): string {
  const parts = [
    viewport.width ? `width=${viewport.width}` : "",
    viewport.initialScale !== undefined ? `initial-scale=${viewport.initialScale}` : "",
    viewport.viewportFit ? `viewport-fit=${viewport.viewportFit}` : "",
    viewport.interactiveWidget ? `interactive-widget=${viewport.interactiveWidget}` : "",
  ];
  return parts.filter(Boolean).join(", ");
}

/**
 * Tags every page carries from the root layout and the app/ file
 * conventions: charset, viewport, theme colours, icons, manifest, rel=me.
 */
export function rootHead(viewport: Viewport, iconVersion = ""): HeadTags {
  const v = iconVersion ? `?${iconVersion}` : "";
  const meta: HeadMeta[] = [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
  const themeColors: (string | { color: string; media?: string })[] = Array.isArray(viewport.themeColor)
    ? viewport.themeColor
    : viewport.themeColor
      ? [viewport.themeColor]
      : [];
  for (const entry of themeColors) {
    if (!entry) continue;
    if (typeof entry === "string") meta.push({ name: "theme-color", content: entry });
    else meta.push({ name: "theme-color", content: entry.color, ...(entry.media ? { media: entry.media } : {}) });
  }
  const links: HeadLink[] = [
    { rel: "icon", href: `/icon${v}`, type: "image/png", sizes: "64x64" },
    { rel: "apple-touch-icon", href: `/apple-icon${v}`, type: "image/png", sizes: "180x180" },
    { rel: "manifest", href: "/manifest.webmanifest" },
    ...IDENTITY_LINKS.map((href) => ({ rel: "me", href })),
  ];
  return { meta, links };
}

/** Minimal HTML for a head, used by tests to compare against crawled pages. */
export function headToHtml(...heads: HeadTags[]): string {
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const attrs = (o: Record<string, string>) =>
    Object.entries(o)
      .map(([k, v]) => `${k === "charSet" ? "charset" : k === "hrefLang" ? "hreflang" : k}="${esc(v)}"`)
      .join(" ");
  return heads
    .flatMap((h) => [
      ...h.meta.map((m) => ("title" in m ? `<title>${m.title}</title>` : `<meta ${attrs(m)}>`)),
      ...h.links.map((l) => `<link ${attrs(l)}>`),
    ])
    .join("\n");
}
