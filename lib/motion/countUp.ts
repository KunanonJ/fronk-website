/*
 * Count-ups (plan morph-count-up_PLAN_20-11-26, research item 2): a cleared
 * figure counts up from zero once, as it first comes into view. Only a figure
 * that is one number with words or signs around it counts ("1,000", "220+",
 * "30%", "THB 2 million"); years, ranges and words stay as they are. Frames
 * never pass the figure, keep its grouping and decimals, and the last one is
 * the figure exactly as its source states it.
 */

/** How long a count takes, in ms. */
export const COUNT_MS = 900;

export type Figure = {
  readonly prefix: string;
  readonly target: number;
  readonly decimals: number;
  /** Written with thousands separators, as "1,000" is. */
  readonly grouped: boolean;
  readonly suffix: string;
};

/** Words or signs, one number (grouped by commas or not), words or signs. */
const FIGURE = /^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(\D*)$/;

/** The figure's parts, or null for a value that should not count. */
export function parseFigure(value: string): Figure | null {
  const match = FIGURE.exec(value);
  if (!match) return null;
  const [, prefix = "", whole = "", fraction = "", suffix = ""] = match;
  const target = Number(`${whole.replaceAll(",", "")}.${fraction || "0"}`);
  if (!Number.isFinite(target) || target <= 0) return null;
  return {
    prefix,
    target,
    decimals: fraction.length,
    grouped: whole.includes(","),
    suffix,
  };
}

/** Fast at first, then settling: most of the count is over in a third. */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

/** The frame at `progress` (0 to 1): rounded down, so it never passes. */
export function countFrame(figure: Figure, progress: number): string {
  const scale = 10 ** figure.decimals;
  const eased = easeOutExpo(Math.min(1, Math.max(0, progress)));
  const value = Math.floor(figure.target * scale * eased) / scale;
  const number = value.toLocaleString("en-US", {
    minimumFractionDigits: figure.decimals,
    maximumFractionDigits: figure.decimals,
    useGrouping: figure.grouped,
  });
  return `${figure.prefix}${number}${figure.suffix}`;
}
