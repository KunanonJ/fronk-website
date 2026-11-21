/*
 * The words of the 404 you fix (now-building-and-genz Phase 6;
 * components/landing/PatchArt.tsx): the gaps' names, the progress line and
 * the two actions under the drawing. In their own module, so only the 404's
 * lazy chunk loads them. The owner approved them as is on 21-11-26.
 */
export const notFoundGameCopy = {
  /** A gap's button: "Patch pixel 3 of 7". */
  gap: (n: number, total: number) => `Patch pixel ${n} of ${total}`,
  /** The line under the drawing before the first patch. */
  hint: "Press a gap to patch it.",
  progress: (patched: number, total: number) =>
    `Patched ${patched} of ${total}.`,
  fixed: "Fixed. Every pixel is back.",
  all: "Patch it all",
  lucky: "I'm feeling lucky",
} as const;
