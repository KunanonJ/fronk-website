import type { AboutParagraph } from "@/lib/content/aboutPage";
import { siteConfig } from "@/lib/site";

/** The site origin without a trailing slash. */
export const SITE_BASE = siteConfig.url.replace(/\/$/, "");

/**
 * An absolute URL for a link in a Markdown twin: external links stay as they
 * are, site paths gain the origin, and in-page anchors resolve against `page`.
 */
export function absoluteUrl(href: string, page = "/"): string {
  if (/^https?:\/\//.test(href)) return href;
  if (href.startsWith("#")) return `${SITE_BASE}${page}${href}`;
  return `${SITE_BASE}${href.startsWith("/") ? href : `/${href}`}`;
}

/** One rich paragraph (text and link spans) as a Markdown line. */
export function paragraphToMarkdown(
  paragraph: AboutParagraph,
  page = "/",
): string {
  return paragraph.spans
    .map((span) =>
      span.type === "link"
        ? `[${span.text}](${absoluteUrl(span.href, page)})`
        : span.text,
    )
    .join("");
}

export function markdownResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
