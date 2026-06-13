import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";

interface StatusTickerProps {
  /** Honest "now" signals — building, location, latest post, real metrics. */
  items: readonly string[];
  className?: string;
}

// A figure token: a digit run (with optional thousands commas) and an optional
// trailing "+" or "%". Used to tint only the numbers mint, leaving prose muted.
const FIGURE = /([0-9][0-9,]*\+?%?)/g;
const IS_FIGURE = /^[0-9][0-9,]*\+?%?$/;

/** Split an item into prose + mint-tinted figures, preserving exact characters. */
function withMintedFigures(item: string) {
  return item.split(FIGURE).map((part, i) =>
    IS_FIGURE.test(part) ? (
      <span key={i} className="text-accent tabular-nums">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function Sequence({
  items,
  ariaHidden,
}: {
  items: readonly string[];
  ariaHidden?: boolean;
}) {
  return (
    <ul aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="label-mono whitespace-nowrap px-6 text-subtle"
        >
          <span aria-hidden className="mr-6 animate-hud-pulse text-accent">
            ✦
          </span>
          {withMintedFigures(item)}
        </li>
      ))}
    </ul>
  );
}

/**
 * A trading-terminal status strip carrying honest "now" signals. Pure CSS
 * marquee: the track holds the items twice and shifts by exactly one copy
 * (`--animate-ticker` → translateX -50%) for a seamless loop. Pauses on hover;
 * the global reduced-motion rule freezes it (content stays readable).
 */
export function StatusTicker({ items, className }: StatusTickerProps) {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        "group relative overflow-hidden border-y border-border py-2.5",
        className,
      )}
    >
      <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]">
        <Sequence items={items} />
        <Sequence items={items} ariaHidden />
      </div>
    </div>
  );
}
