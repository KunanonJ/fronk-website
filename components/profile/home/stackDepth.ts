/*
 * The work stack's geometry (profile redesign Phase 3, design spec 8.4).
 * Pure, so the scroll handler stays small and the rules are tested.
 */

/** Where a card's list item sits in the viewport, from getBoundingClientRect. */
export interface StackBox {
  readonly top: number;
  readonly bottom: number;
}

/**
 * How deep each card lies under the stack: for every later card, how far it
 * has slid over this one, from 0 (not yet touching) to 1 (resting on it at its
 * own sticky offset, `step` px lower per card), summed. Card i under two
 * resting cards has depth 2.
 */
export function stackDepths(
  boxes: readonly StackBox[],
  step: number,
): number[] {
  return boxes.map((box, i) => {
    let depth = 0;
    for (let j = i + 1; j < boxes.length; j += 1) {
      const travel = box.bottom - box.top - step * (j - i);
      if (travel <= 0) continue;
      const over = (box.bottom - boxes[j]!.top) / travel;
      depth += Math.min(1, Math.max(0, over));
    }
    return depth;
  });
}

/**
 * The scroll offset at which card `index` rests: stuck at its sticky top with
 * the next card still a gap below it, so nothing covers it. Positions come
 * from the list, which is not sticky: a stuck item's own box has moved.
 */
export function restingScrollTop({
  listTop,
  heights,
  gap,
  index,
  stickyTop,
}: {
  /** The list's top in document coordinates (box top plus scrollY). */
  listTop: number;
  /** Every item's height, in order. */
  heights: readonly number[];
  /** The list's row gap. */
  gap: number;
  index: number;
  /** The item's sticky `top`. */
  stickyTop: number;
}): number {
  let top = listTop;
  for (let k = 0; k < index; k += 1) top += heights[k]! + gap;
  return Math.max(0, top - stickyTop);
}
