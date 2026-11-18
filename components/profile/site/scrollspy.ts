import { useEffect } from "react";

/*
 * The Home scrollspy (profile redesign, design spec 7.2). The observer's band
 * sits across the top of the viewport (SPY_MARGIN), and the section the reader
 * is in is the topmost section the band holds.
 *
 * The sections never overlap and come in page order, so the topmost visible one
 * is the first visible one in that order. The positions an observer reports
 * are not used: each one is the section's top at the moment it entered the band,
 * and the page has moved on since, so comparing them picks the wrong section
 * whenever the reader's scroll crosses a boundary.
 */

/** The band an IntersectionObserver watches: a section counts inside it. */
export const SPY_MARGIN = "-20% 0px -60% 0px";

/** The first section of `order` that is visible, or none. */
export function topmostSection(
  order: readonly string[],
  visible: ReadonlySet<string>,
): string | undefined {
  return order.find((id) => visible.has(id));
}

/**
 * Reports the section in view while the page scrolls: `onSection` runs with the
 * id of the topmost visible section of `order`, or with none. Only on `active`
 * pages (Home) with the sections in the page.
 */
export function useScrollspy(
  active: boolean,
  order: readonly string[],
  onSection: (section: string | undefined) => void,
): void {
  useEffect(() => {
    if (!active || typeof IntersectionObserver === "undefined") return;
    const sections = order
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        onSection(topmostSection(order, visible));
      },
      { rootMargin: SPY_MARGIN, threshold: 0 },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [active, order, onSection]);
}
