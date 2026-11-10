import { cn } from "@/lib/utils/cn";

type Option = {
  label: string;
  value: string;
  /** Accessible name when the visible label is shortened; must contain it. */
  ariaLabel?: string;
};

/**
 * Segmented control (bento canvas, design spec 3.6): pressed buttons in a
 * labelled group, not tabs. The pressed segment is ink (--cta). The track
 * is 56 px tall, so the 28 px bento radius reads as a pill on one line and
 * as a rounded card when the segments wrap (rounded-full would make an oval).
 */
export function Segmented({
  label,
  options,
  value,
  onChange,
  tone = "page",
  layout = "wrap",
  className,
}: {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  /** The group's fill: the page colour inside cards, surface on the page. */
  tone?: "page" | "surface";
  /**
   * "wrap" lets segments flow onto more lines;
   * "row" keeps them on one line in equal columns, for short labels in a
   * narrow card.
   */
  layout?: "wrap" | "row";
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "gap-1 rounded-bento border border-hairline p-[5px]",
        layout === "row" ? "grid auto-cols-fr grid-flow-col" : "flex flex-wrap",
        tone === "page" ? "bg-page" : "bg-surface",
        className,
      )}
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-11 flex-auto rounded-full border-0 px-[18px] text-sm font-medium",
              on ? "bg-cta text-on-cta" : "bg-transparent text-ink-2",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
