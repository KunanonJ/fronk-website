import type { SearchEntry } from "@/lib/search/match";

/*
 * The site's index (/search.json), for the search dialog and the link
 * previews. Apart from the matching (lib/search/match.ts), which only the
 * dialog runs: the link previews' listener is in the entry chunk every page
 * loads, and it needs only this.
 */

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
