import { cn } from "@/lib/utils/cn";

type Option = { label: string; value: string };

/**
 * Segmented control (bento canvas, design spec 3.6): pressed buttons in a
 * labelled group, not tabs. The pressed segment is ink (--cta).
 */
export function Segmented({
  label,
  options,
  value,
  onChange,
  tone = "page",
  className,
}: {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  /** The group's fill: the page colour inside cards, surface on the page. */
  tone?: "page" | "surface";
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap gap-1 rounded-full border border-hairline p-[5px]",
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
