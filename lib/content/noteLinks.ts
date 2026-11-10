import { linkifyInternalPaths } from "@/lib/content/linkify";

/** A link found in a post body, with the short label the aside shows. */
export type NoteLink = { href: string; label: string };

/** The minimum of a Portable Text block this module reads. */
type BodyBlock = {
  _type?: string;
  children?: readonly { _type?: string; marks?: unknown }[];
  markDefs?: readonly { _key?: string; _type?: string; href?: unknown }[];
};

const SITE_HOSTS = new Set(["kunanonj.com", "www.kunanonj.com"]);

/** Site paths read as paths, other sites as host + path. */
function labelFor(href: string): string {
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    if (SITE_HOSTS.has(url.hostname)) return url.pathname + url.search;
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return href;
  }
}

function collect(hrefs: Iterable<string>): NoteLink[] {
  const seen = new Set<string>();
  const out: NoteLink[] = [];
  for (const href of hrefs) {
    if (!href || seen.has(href)) continue;
    seen.add(href);
    out.push({ href, label: labelFor(href) });
  }
  return out;
}

/**
 * The links in a Portable Text body, in reading order, once each ("Linked in
 * this note", bento canvas Post; the canvas leaves the source open).
 */
export function portableTextLinks(blocks: readonly BodyBlock[]): NoteLink[] {
  function* hrefs() {
    for (const block of blocks) {
      if (block._type !== "block") continue;
      const defs = new Map(
        (block.markDefs ?? [])
          .filter((d) => d._type === "link" && typeof d.href === "string")
          .map((d) => [d._key, d.href as string]),
      );
      for (const child of block.children ?? []) {
        if (!Array.isArray(child.marks)) continue;
        for (const mark of child.marks) {
          const href = typeof mark === "string" ? defs.get(mark) : undefined;
          if (href) yield href;
        }
      }
    }
  }
  return collect(hrefs());
}

/** The site paths written into plain-text paragraphs (the fallback posts). */
export function paragraphLinks(paragraphs: readonly string[]): NoteLink[] {
  return collect(
    paragraphs.flatMap((p) =>
      linkifyInternalPaths(p).flatMap((s) =>
        s.type === "link" ? [s.href] : [],
      ),
    ),
  );
}
