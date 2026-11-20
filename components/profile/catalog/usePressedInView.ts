import { useEffect, type RefObject } from "react";

/*
 * On phones a filter group that does not fit holds one row and scrolls
 * sideways (`.pf-filter[role="group"]` in src/styles/profile/cutover.css).
 * A shared link can press an option past the row's edge, so whenever the
 * pressed option changes this scrolls the row, never the page, until that
 * option is in view. Keyboard focus needs nothing: the browser brings a
 * focused option into view itself.
 */
export function usePressedInView(
  row: RefObject<HTMLElement | null>,
  pressed: string,
) {
  useEffect(() => {
    const group = row.current;
    const option = group?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!group || !option || group.scrollWidth <= group.clientWidth) return;
    const box = group.getBoundingClientRect();
    const at = option.getBoundingClientRect();
    if (at.left >= box.left && at.right <= box.right) return;
    // Centres the option in the row; the row alone moves.
    group.scrollBy({ left: at.left - box.left - (box.width - at.width) / 2 });
  }, [row, pressed]);
}
