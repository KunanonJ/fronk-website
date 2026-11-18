/*
 * The Home scrollspy (profile redesign, design spec 7.2). The observer's band
 * sits across the top of the viewport (SPY_MARGIN); the section the reader is
 * in is the topmost section that band holds. Pure, so the choice is tested
 * without an IntersectionObserver.
 */

/** The band an IntersectionObserver watches: a section counts inside it. */
export const SPY_MARGIN = "-20% 0px -60% 0px";

export interface VisibleSection {
  readonly id: string;
  /** Its top edge in px, relative to the viewport. */
  readonly top: number;
}

/** The id of the topmost visible section, or none when no section is in the band. */
export function currentSection(
  visible: readonly VisibleSection[],
): string | undefined {
  let best: VisibleSection | undefined;
  for (const section of visible) {
    if (best === undefined || section.top < best.top) best = section;
  }
  return best?.id;
}
