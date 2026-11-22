/**
 * Keyboard focus, not a click or a tap: only it calls for scrolling a
 * focused item into view (WCAG 2.4.11). A click that scrolled its row would
 * move the item from under the pointer before the press ends.
 */
export function focusVisible(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * Scrolls `row`, a sideways scroller, and nothing else (never the page),
 * until `item` is wholly inside it: just far enough to clear the nearer
 * edge by the row's own `scroll-padding-inline`, or to the row's middle
 * with `centre`. Does nothing while it is wholly inside already.
 *
 * Browsers bring a focused item into its scroller only when none of it
 * shows: one partly past the edge keeps focus there, mostly hidden, its
 * ring cut off (UX hunt 2, U12 and U22).
 */
export function revealInRow(
  row: HTMLElement,
  item: HTMLElement,
  {
    centre = false,
    behavior = "auto",
  }: { centre?: boolean; behavior?: ScrollBehavior } = {},
): void {
  const style = getComputedStyle(row);
  const padStart = parseFloat(style.scrollPaddingInlineStart) || 0;
  const padEnd = parseFloat(style.scrollPaddingInlineEnd) || 0;
  const box = row.getBoundingClientRect();
  const at = item.getBoundingClientRect();
  // The scrollport: inside the row's border.
  const start = box.left + row.clientLeft;
  const end = start + row.clientWidth;
  if (at.left >= start + padStart && at.right <= end - padEnd) return;
  let left: number;
  if (centre) left = at.left + at.width / 2 - (start + end) / 2;
  else if (at.left < start + padStart) left = at.left - start - padStart;
  else left = at.right - end + padEnd;
  row.scrollBy({ left, behavior });
}
