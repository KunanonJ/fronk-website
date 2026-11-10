/** Search engines show about 155-160 characters of a meta description. */
export const META_DESCRIPTION_MAX = 158;

/**
 * A meta description that fits search results without being cut mid-word:
 * unchanged when short enough; otherwise cut at the last sentence end past
 * 110 characters, or else at a word boundary with an ellipsis. Page text and
 * JSON-LD keep the full wording.
 */
export function clampDescription(
  text: string,
  max = META_DESCRIPTION_MAX,
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const window = clean.slice(0, max);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (sentenceEnd >= 110) return window.slice(0, sentenceEnd + 1);
  const wordEnd = window.slice(0, max - 1).lastIndexOf(" ");
  return `${window.slice(0, wordEnd).replace(/[\s,;:.—-]+$/, "")}…`;
}
