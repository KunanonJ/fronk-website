import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * Labels (profile redesign, design spec 6.2 to 6.6): chip, badge, eyebrow
 * row, status dot and pixel marks. Decorative parts are aria-hidden and
 * always sit next to words that carry the meaning.
 */

export function Chip({
  children,
  kind = "default",
}: {
  children: ReactNode;
  /** illustration: pinned 8 px inside code-drawn media. */
  kind?: "default" | "illustration";
}) {
  return (
    <span
      className={cn(
        "ds-chip",
        kind === "illustration" && "ds-chip--illustration",
      )}
    >
      {children}
    </span>
  );
}

/** The one solid accent label on a page, such as "Currently building". */
export function Badge({ children }: { children: ReactNode }) {
  return <span className="ds-badge">{children}</span>;
}

/** A mono section label followed by a hairline to the edge. */
export function EyebrowRow({
  children,
  centred = false,
  as: Tag = "p",
  id,
}: {
  children: ReactNode;
  centred?: boolean;
  as?: "p" | "h2" | "h3";
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={cn("ds-eyebrow t-meta", centred && "ds-eyebrow--centred")}
    >
      {children}
    </Tag>
  );
}

/** A live marker that pings once; `plain` is the static 7 px dot. */
export function StatusDot({
  ping = true,
  plain = false,
}: {
  ping?: boolean;
  plain?: boolean;
}) {
  if (plain) return <span className="ds-dot" aria-hidden="true" />;
  return (
    <span
      className={cn("ds-status-dot", ping && "ds-status-dot--ping")}
      aria-hidden="true"
    />
  );
}

const PIXEL_CLASS = {
  mark: "ds-px-mark",
  bullet: "ds-px-dot",
  word: "ds-word-mark",
} as const;

/** mark: the two-pixel kicker mark. bullet: a 6 px square. word: the coral stamp. */
export function PixelMark({
  kind = "mark",
}: {
  kind?: keyof typeof PIXEL_CLASS;
}) {
  return <span className={PIXEL_CLASS[kind]} aria-hidden="true" />;
}
