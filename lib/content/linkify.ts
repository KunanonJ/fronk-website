export type TextSegment =
  { type: "text"; text: string } | { type: "link"; text: string; href: string };

/**
 * Internal site paths written inline in plain-text post bodies, e.g.
 * "Case hub: /ventures/manut." Group 1 is the character before the path
 * (start, whitespace or an opening quote/paren), so URLs like
 * `https://x.com/topics/a` and words like "AR/AP" never match. The negative
 * lookahead keeps trailing punctuation out of the link. No lookbehind: this
 * runs in the browser too, and older Safari cannot parse it.
 */
const INTERNAL_PATH =
  /(^|[\s("'“‘])(\/(?:about|portfolio|(?:th\/)?topics\/[a-z0-9]+(?:-[a-z0-9]+)*|(?:ventures|blog|portfolio)\/[a-z0-9]+(?:-[a-z0-9]+)*))(?![\w/-])/g;

/** Split text into plain and internal-link segments, in order. */
export function linkifyInternalPaths(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INTERNAL_PATH)) {
    const lead = match[1] ?? "";
    const path = match[2] ?? "";
    const start = (match.index ?? 0) + lead.length;
    if (start > cursor) {
      segments.push({ type: "text", text: text.slice(cursor, start) });
    }
    segments.push({ type: "link", text: path, href: path });
    cursor = start + path.length;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", text: text.slice(cursor) });
  }
  return segments;
}
