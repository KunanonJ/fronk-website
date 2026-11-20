import { useMemo, type ReactNode } from "react";
import { PORTRAIT_COLOURS, portraitCells } from "@/lib/brand/pixelPortrait";
import { cn } from "@/lib/utils/cn";

/*
 * The pixel portrait drawn as SVG (lib/brand/pixelPortrait.ts). Its cells sit
 * in 16 groups, one per rank of the dither's 4 x 4 matrix, one path per colour
 * in each: showing the groups below `shown` draws it in the order the dither
 * prints in (the intro, the /about dissolve to the photo). The background is
 * cells too, so a hidden group shows what is behind the portrait. Its colour
 * is `--portrait-bg` (the accent by default). Decorative unless `label` is
 * set; crisp edges at any size. `children` are drawn over it, in its cells
 * (the nav avatar's wink).
 */

const RANKS = 16;

export function PixelPortrait({
  rows,
  shown = RANKS,
  label,
  className,
  children,
}: {
  rows: readonly string[];
  /** Ranks drawn, 0 to 16: all of them by default. */
  shown?: number;
  /** The portrait's name for assistive technology; none hides it. */
  label?: string;
  className?: string;
  /** SVG drawn over the portrait, in its cells. */
  children?: ReactNode;
}) {
  const groups = useMemo(() => {
    const byRank = Array.from(
      { length: RANKS },
      () => new Map<string, string[]>(),
    );
    for (const { x, y, key, rank } of portraitCells(rows)) {
      const paths = byRank[rank]!;
      const list = paths.get(key) ?? [];
      list.push(`M${x} ${y}h1v1h-1z`);
      paths.set(key, list);
    }
    return byRank;
  }, [rows]);
  const size = rows.length;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("pf-portrait", className)}
      shapeRendering="crispEdges"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true, focusable: false })}
    >
      {groups.map((paths, rank) => (
        <g key={rank} visibility={rank < shown ? undefined : "hidden"}>
          {[...paths].map(([key, cells]) => (
            <path
              key={key}
              d={cells.join("")}
              {...(key === "."
                ? { className: "pf-portrait__bg" }
                : {
                    fill: PORTRAIT_COLOURS[
                      key as keyof typeof PORTRAIT_COLOURS
                    ],
                  })}
            />
          ))}
        </g>
      ))}
      {children}
    </svg>
  );
}
