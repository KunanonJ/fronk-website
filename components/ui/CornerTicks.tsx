import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

export type Corner = "tl" | "tr" | "bl" | "br";

const ALL_CORNERS: readonly Corner[] = ["tl", "tr", "bl", "br"];

/** Which two sides each corner mark draws (an L-shaped crop mark). */
const CORNER_SIDES: Record<Corner, string> = {
  tl: "border-l border-t",
  tr: "border-r border-t",
  bl: "border-l border-b",
  br: "border-r border-b",
};

interface CornerTicksProps {
  /** Corners to mark. Defaults to all four. */
  corners?: readonly Corner[];
  /** Arm length of each mark, px. */
  size?: number;
  /** Offset from the edge of the positioned parent, px. */
  inset?: number;
  /** Color override via a text-color class (marks use `border-current`). */
  className?: string;
}

/**
 * Decorative corner crop-marks — the matveyan "HUD" motif. Render inside a
 * `position: relative` parent (a button, a section, the window frame). Marks
 * inherit their colour from `currentColor`, so pass a `text-*` class to recolor.
 */
export function CornerTicks({
  corners = ALL_CORNERS,
  size = 6,
  inset = 0,
  className,
}: CornerTicksProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 text-border-strong",
        className,
      )}
    >
      {corners.map((corner) => {
        const style: CSSProperties = {
          width: size,
          height: size,
          top: corner.startsWith("t") ? inset : undefined,
          bottom: corner.startsWith("b") ? inset : undefined,
          left: corner.endsWith("l") ? inset : undefined,
          right: corner.endsWith("r") ? inset : undefined,
        };
        return (
          <span
            key={corner}
            data-corner={corner}
            className={cn("absolute border-current", CORNER_SIDES[corner])}
            style={style}
          />
        );
      })}
    </span>
  );
}
