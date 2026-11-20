/*
 * Words a line must not split, joined by no-break spaces (U+00A0): the
 * names that read as one word ("Manut / AI", "The / Binary Holdings" on
 * phones; UX sweep, 21-11-26) and the title "IT Manager", and a heading's
 * last two words. Only the spaces change, never the words. Meta tags,
 * JSON-LD, the Markdown pages and llms.txt read the same copy with plain
 * spaces, so this is applied where a page draws text: in display-only copy
 * here in lib/content, and in the components that draw shared copy.
 */

const NBSP = " ";
const NAMES = /\b(?:Manut AI|The Binary Holdings|IT Manager)\b/g;

/** `text` with the spaces inside each name made no-break. */
export function keepNamesWhole(text: string): string {
  return text.replace(NAMES, (name) => name.replaceAll(" ", NBSP));
}

/** `text` with its last two words joined, so no line holds one alone. */
export function keepLastWordsTogether(text: string): string {
  return text.replace(/ (?=\S+$)/, NBSP);
}
