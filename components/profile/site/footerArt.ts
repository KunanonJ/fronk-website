/*
 * The two pixel drawings of the footer (profile redesign, design spec 7.7), one
 * character per cell: k ink, w paper, t soft, g tint, a accent, c coral (see
 * PixelArt). Every row of a drawing is the same length, which a test checks.
 */

/** A browser window with its cursor. */
export const BROWSER_ART = [
  "kkkkkkkkkkkkkkkk",
  "ktcatttttttttttk",
  "kwwwwwwwwwwwwwwk",
  "kwggggwwwwwwwwwk",
  "kwggggggwwwwwwwk",
  "kwggwwwwwwwwwwwk",
  "kwwwwwwwwwkwwwwk",
  "kwgggggwwwkkwwwk",
  "kwggggwwwwkkkwwk",
  "kwwwwwwwwwkkkkwk",
  "kwwwwwwwwwwwwwwk",
  "kkkkkkkkkkkkkkkk",
] as const;

/** A phone with an accent tile on its screen. */
export const PHONE_ART = [
  "kkkkkkkkkk",
  "kwwwwwwwwk",
  "kwttttttwk",
  "kwwwwwwwwk",
  "kwgggwwwwk",
  "kwggggwwwk",
  "kwwwwwwwwk",
  "kwwwwwwwwk",
  "kwwwwaawwk",
  "kwwwwwwwwk",
  "kwgggwwwwk",
  "kwgggwwwwk",
  "kwwwwwwwwk",
  "kwwwwwwwwk",
  "kwwwwwwwwk",
  "kwwwkkwwwk",
  "kwwwwwwwwk",
  "kkkkkkkkkk",
] as const;
