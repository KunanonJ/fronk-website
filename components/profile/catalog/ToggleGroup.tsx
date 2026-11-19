import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * A group of toggle pills (profile redesign Phase 7, group D2): the filters
 * and view switches of the résumé, press and blog, as the portfolio's filter
 * draws them (ink when pressed). Each option is a button with aria-pressed;
 * the group is named for screen readers. A count, when given, follows the
 * label after a space, so the name reads "SME 3". Styles: the shared filter
 * bar's `.pf-filter` and `.pf-filter__option` (src/styles/profile/
 * cutover.css), and `.pf-count` (cutover.css).
 */

export interface ToggleOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly count?: number;
}

export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  /** The group's accessible name, e.g. "Résumé detail". */
  label: string;
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("pf-filter", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className="pf-filter__option"
        >
          {option.count === undefined ? (
            option.label
          ) : (
            <Fragment>
              {option.label} <span className="pf-count">{option.count}</span>
            </Fragment>
          )}
        </button>
      ))}
    </div>
  );
}
