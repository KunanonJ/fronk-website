/*
 * Search over the site's index (/search.json, src/server/text/searchIndex.ts):
 * the entry type both sides share, and the matching the search dialog runs.
 * Every word of the query must appear in the title, the summary, the meta or
 * the path; titles weigh most. Accents fold away ("resume" finds "Résumé"),
 * while Thai keeps its vowel and tone marks.
 */

export type SearchKind = "page" | "case" | "topic" | "skill";

export interface SearchEntry {
  readonly path: string;
  readonly title: string;
  readonly kind: SearchKind;
  /** One line: the page's description, a case's tagline. */
  readonly summary: string;
  /** A case's eyebrow ("Internal platform · May to Oct 2026"). */
  readonly meta?: string;
  /** Thai pages say so, for the result's `lang`. */
  readonly lang?: "th";
}

/** The groups, in the order the dialog shows them. */
export const SEARCH_GROUPS: readonly SearchKind[] = [
  "page",
  "case",
  "topic",
  "skill",
];

/** Lower case, Latin accents removed (U+0300 to U+036F only, not Thai). */
function fold(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * The entries matching `query`, best first. An empty query lists the pages
 * and the case studies, in index order.
 */
export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
): SearchEntry[] {
  const needle = fold(query.trim());
  if (!needle) {
    return entries.filter(
      (entry) => entry.kind === "page" || entry.kind === "case",
    );
  }
  const words = needle.split(/\s+/);
  const scored: { entry: SearchEntry; score: number; at: number }[] = [];
  entries.forEach((entry, at) => {
    const title = fold(entry.title);
    const rest = fold(`${entry.summary} ${entry.meta ?? ""} ${entry.path}`);
    if (!words.every((word) => title.includes(word) || rest.includes(word))) {
      return;
    }
    let score = title.startsWith(needle) ? 100 : 0;
    for (const word of words) score += title.includes(word) ? 20 : 2;
    scored.push({ entry, score, at });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .map(({ entry }) => entry);
}

/**
 * Results in the dialog's groups: each group in SEARCH_GROUPS order, its
 * entries best first; empty groups left out.
 */
export function groupResults(
  results: readonly SearchEntry[],
): { kind: SearchKind; entries: SearchEntry[] }[] {
  return SEARCH_GROUPS.map((kind) => ({
    kind,
    entries: results.filter((entry) => entry.kind === kind),
  })).filter((group) => group.entries.length > 0);
}

let index: Promise<SearchEntry[]> | null = null;

/** The index, fetched once per page load and shared by its users. */
export function loadSearchIndex(): Promise<SearchEntry[]> {
  index ??= fetch("/search.json").then((response) => {
    if (!response.ok) throw new Error(`search.json: ${response.status}`);
    return response.json() as Promise<SearchEntry[]>;
  });
  index.catch(() => {
    index = null;
  });
  return index;
}
