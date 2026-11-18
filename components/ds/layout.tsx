import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * Layout primitives (profile redesign, design spec 2.11 and 6.4): the page
 * column and the tile. Grids and spans belong to the section that lays the
 * tiles out.
 */

export function Wrap({
  children,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  as?: "div" | "section" | "main" | "header" | "footer";
  className?: string;
}) {
  return <Tag className={cn("ds-wrap", className)}>{children}</Tag>;
}

const TONE = {
  well: null,
  tint: "ds-tile--tint",
  paper: "ds-tile--paper",
  stats: "ds-tile--stats",
} as const;

export function Tile({
  children,
  tone = "well",
  as: Tag = "div",
  className,
  labelledBy,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE;
  /** A section or article when the tile has a heading. */
  as?: "div" | "section" | "article";
  className?: string;
  /** The id of the tile's heading, for its accessible name. */
  labelledBy?: string;
}) {
  return (
    <Tag
      className={cn("ds-tile", TONE[tone], className)}
      aria-labelledby={labelledBy}
    >
      {children}
    </Tag>
  );
}
