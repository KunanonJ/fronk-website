/*
 * The words of the 404 you fix (now-building-and-genz Phase 6;
 * components/landing/PatchArt.tsx): the gaps' names, the progress line and
 * the two actions under the drawing. In their own module, so only the 404's
 * lazy chunk loads them. All DRAFT for the owner.
 */
export const notFoundGameCopy = {
  /** A gap's button: "Patch pixel 3 of 7". */
  gap: (n: number, total: number) => `Patch pixel ${n} of ${total}`, // DRAFT
  /** The line under the drawing before the first patch. */
  hint: "Press a gap to patch it.", // DRAFT
  progress: (patched: number, total: number) =>
    `Patched ${patched} of ${total}.`, // DRAFT
  fixed: "Fixed. Every pixel is back.", // DRAFT
  all: "Patch it all", // DRAFT
  lucky: "I'm feeling lucky", // DRAFT
} as const;
