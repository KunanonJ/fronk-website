/*
 * The status pages' pixel drawings (profile redesign Phase 7f; our own, drawn
 * for this site), one character per cell for PixelArt: k ink, w paper,
 * t soft, g tint, a accent, c coral; any other character is an empty cell.
 * Every row of a drawing is the same length, which a test checks.
 */

/** 404: a page of tiles with one slot empty, its tile fallen out below. */
export const NOT_FOUND_ART = [
  "kkkkkkkkkkkkkkkkkkkkkkk",
  "ktcattttttttttttttttttk",
  "kwwwwwwwwwwwwwwwwwwwwwk",
  "kwggggwggggwaaaawggggwk",
  "kwggggwggggwaaaawggggwk",
  "kwggggwggggwaaaawggggwk",
  "kwwwwwwwwwwwwwwwwwwwwwk",
  "kwggggwggggwttttwggggwk",
  "kwggggwggggwttttwggggwk",
  "kwggggwggggwttttwggggwk",
  "kwwwwwwwwwwwwwwwwwwwwwk",
  "kkkkkkkkkkkkkkkkkkkkkkk",
  ".......................",
  "...............cccc....",
  "...............cccc....",
  "...............cccc....",
] as const;

/** An error: the same page of tiles with a crack running through it. */
export const ERROR_ART = [
  "kkkkkkkkkkkkkkkkkkkkkkk",
  "ktcattttttttttttttttttk",
  "kwwwwwwwwwcwwwwwwwwwwwk",
  "kwggggwgggcwggggwggggwk",
  "kwggggwggggcggggwggggwk",
  "kwggggwgggcwggggwggggwk",
  "kwwwwwwwwwwcwwwwwwwwwwk",
  "kwggggwggggwcgggwggggwk",
  "kwggggwggggcggggwggggwk",
  "kwggggwggggwcgggwggggwk",
  "kwwwwwwwwwwwwcwwwwwwwwk",
  "kkkkkkkkkkkkkkkkkkkkkkk",
] as const;
