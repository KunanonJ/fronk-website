import type { BentoSpan } from "@/components/bento/Bento";
import type { HubSpan } from "@/components/landing/discovery/hubLayout";
import type { HeadlineLine } from "@/lib/content/portfolio";

/*
 * Layout rules for the portfolio (bento canvas 4.5, 4.6). The canvas draws
 * the index with all four projects and one project page (TBH Intranet);
 * these rules give the same result there and derive the rest from the data.
 */

/**
 * Spans for the project cards shown on the index. One card fills the row
 * (a filtered view). Otherwise wide and narrow cards alternate in pairs,
 * 2 | 1 then 1 | 2, as the canvas draws TBH | Node, Email | AI; the last
 * card widens to close a short row. At two columns a wide card takes the
 * row, and a narrow one that would sit alone widens too.
 */
export function portfolioGrid(count: number): HubSpan[] {
  if (count <= 0) return [];
  if (count === 1) return [{ md: 2, lg: 3 }];

  const lg: BentoSpan[] = [];
  for (let i = 0; i < count; i += 1)
    lg.push(i % 4 === 0 || i % 4 === 3 ? 2 : 1);
  const left = lg.reduce<number>((sum, span) => sum + span, 0) % 3;
  if (left > 0) lg[count - 1] = (lg[count - 1]! + 3 - left) as BentoSpan;

  const md = lg.map((span): 1 | 2 => (span === 1 ? 1 : 2));
  let column = 0;
  md.forEach((span, i) => {
    if (span === 1 && column === 0 && (md[i + 1] ?? 2) === 2) md[i] = 2;
    column = (column + md[i]!) % 2;
  });

  return lg.map((span, i) => ({ md: md[i]!, lg: span }));
}

/** Words that read as connectors: a tagline breaks after one and mutes it. */
const CONNECTORS = new Set([
  "for",
  "and",
  "with",
  "to",
  "of",
  "in",
  "on",
  "by",
]);

/** Connectors plus the leading words the canvas also mutes ("One"). */
const MUTED = new Set([...CONNECTORS, "one", "a", "an", "the"]);

function isMuted(word: string): boolean {
  return MUTED.has(word.toLowerCase());
}

/** Words as segments, runs of muted and plain words merged. */
function segments(words: readonly string[]): HeadlineLine {
  const out: { text: string; muted?: boolean }[] = [];
  for (const word of words) {
    const muted = isMuted(word);
    const last = out[out.length - 1];
    if (last && Boolean(last.muted) === muted) last.text += ` ${word}`;
    else out.push(muted ? { text: word, muted } : { text: word });
  }
  return out;
}

/**
 * A project's tagline as the last two h1 lines, as the canvas sets TBH
 * Intranet: "One back office for / a multi-entity group." The first line
 * ends after a connector ("for") or a comma, the one nearest the middle,
 * else at the most even split; its connectors are muted. The second line is
 * the accent line, set whole.
 */
export function taglineLines(tagline: string): HeadlineLine[] {
  const words = tagline.trim().split(/\s+/);
  if (words.length < 2) return [[{ text: tagline.trim() }]];

  const breaks = words.slice(1).map((_, i) => {
    const k = i + 1;
    const before = words.slice(0, k).join(" ").length;
    const after = words.slice(k).join(" ").length;
    const end = words[k - 1]!;
    return {
      k,
      gap: Math.abs(before - after),
      preferred: CONNECTORS.has(end.toLowerCase()) || end.endsWith(","),
    };
  });
  const pool = breaks.some((b) => b.preferred)
    ? breaks.filter((b) => b.preferred)
    : breaks;
  const { k } = pool.reduce((best, b) => (b.gap < best.gap ? b : best));

  return [segments(words.slice(0, k)), [{ text: words.slice(k).join(" ") }]];
}
