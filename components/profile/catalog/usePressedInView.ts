import { useEffect, type RefObject } from "react";
import { focusVisible, revealInRow } from "@/lib/utils/revealInRow";

/*
 * On phones a filter group that does not fit holds one row and scrolls
 * sideways (`.pf-filter[role="group"]` in src/styles/profile/cutover.css).
 * This scrolls the row, never the page:
 * - whenever the pressed option changes (a shared link can press one past
 *   the row's edge), until that option is in view, in the middle;
 * - when the keyboard focuses an option that is not wholly in view, just
 *   far enough to show all of it and its ring. Browsers scroll a focused
 *   option into view only when none of it shows (UX hunt 2, U12).
 */
export function usePressedInView(
  row: RefObject<HTMLElement | null>,
  pressed: string,
) {
  useEffect(() => {
    const group = row.current;
    const option = group?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!group || !option || group.scrollWidth <= group.clientWidth) return;
    revealInRow(group, option, { centre: true });
  }, [row, pressed]);

  useEffect(() => {
    const group = row.current;
    if (!group) return;
    // A frame later: focus events fire before the browser's own scroll
    // into view, which this then finishes.
    let frame = 0;
    const onFocus = (event: FocusEvent) => {
      const option = event.target as HTMLElement;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (document.activeElement !== option || !focusVisible(option)) return;
        if (group.scrollWidth <= group.clientWidth) return;
        revealInRow(group, option);
      });
    };
    group.addEventListener("focusin", onFocus);
    return () => {
      group.removeEventListener("focusin", onFocus);
      cancelAnimationFrame(frame);
    };
  }, [row]);
}
