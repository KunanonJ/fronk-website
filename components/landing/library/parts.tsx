import { Fragment, type ReactNode } from "react";
import { EyebrowChip } from "@/components/bento/Chips";
import type { HeadlineLine } from "@/lib/content/topics/pillars";
import { cn } from "@/lib/utils/cn";

/*
 * Shared pieces of the library pages (bento redesign, phase 7f; design spec
 * 4.10-4.14): the hero, the filter bar, card shells and labels.
 */

/** A bento card shell for cards whose header is more than a kicker. */
export const CARD =
  "relative flex min-w-0 flex-col overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card";

/** Geist Mono 12 px uppercase label (counts, sources, result lines). */
export const MONO_LABEL =
  "m-0 font-mono text-xs tracking-[0.06em] text-ink-2 uppercase";

/** Inner well inside a card: page fill, hairline, 20 px radius. */
export const WELL = "rounded-well border border-hairline bg-page";

/** The card's text link ("Open hub →"): 14 px, link colour, 44 px target. */
export const TEXT_LINK =
  "inline-flex min-h-11 items-center self-start text-sm font-medium no-underline";

/** Off-site links open in a new tab. */
export const EXTERNAL = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/** Two digits, as the canvas counts ("03 tools"). */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "03 tools", "01 ticket". */
export function countLabel(n: number, one: string, many: string): string {
  return `${pad2(n)} ${n === 1 ? one : many}`;
}

/**
 * Card kicker as a 13 px pill on the page colour. `as` keeps it a heading
 * when it names the card, or a paragraph when an h2 below does; `marker`
 * (the square's size and fill classes) puts a square before the text.
 */
export function Kicker({
  as: Tag = "h2",
  id,
  marker,
  className,
  children,
}: {
  as?: "h2" | "p";
  id?: string;
  marker?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "m-0 inline-flex items-center gap-2 self-start rounded-full border border-hairline bg-page px-3 py-[7px] text-meta leading-none font-medium text-ink",
        className,
      )}
    >
      {marker ? <span aria-hidden className={cn("shrink-0", marker)} /> : null}
      {children}
    </Tag>
  );
}

/** The h1 as the canvas draws it: one block per line, the last in accent. */
export type LibraryHeadline = {
  lines: readonly HeadlineLine[];
  accent: string;
};

/**
 * The hero: eyebrow, the h1 line by line (muted connector words, accent last
 * line), the lead and anything after it. The h1 is the LCP element; its lines
 * only slide (`kj-lines`).
 */
export function LibraryHero({
  eyebrow,
  headline,
  lede,
  children,
}: {
  eyebrow: string;
  headline: LibraryHeadline;
  lede: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col items-start gap-6"
    >
      <EyebrowChip>{eyebrow}</EyebrowChip>
      <h1 id="hero-title" className="kj-lines m-0 text-title text-ink">
        {headline.lines.map((line, i) => (
          <Fragment key={i}>
            <span className="block">
              {line.map((segment, j) =>
                typeof segment === "string" ? (
                  segment
                ) : (
                  <span key={j} className="text-ink-3">
                    {segment.muted}
                  </span>
                ),
              )}
            </span>{" "}
          </Fragment>
        ))}
        <span className="block text-mark">{headline.accent}</span>
      </h1>
      <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
        {lede}
      </p>
      {children}
    </section>
  );
}

export type FilterOption<T extends string> = {
  id: T;
  label: string;
  count: number;
};

/**
 * Filter bar (Stack, Build): a segmented group of pressed buttons with
 * counts on the surface, and a polite result line. The filter is a URL
 * search param owned by the route.
 */
export function FilterBar<T extends string>({
  label,
  options,
  value,
  onChange,
  result,
}: {
  label: string;
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (next: T) => void;
  result: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
      <div
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-bento border border-hairline bg-surface p-[5px] shadow-card"
      >
        {options.map((option) => {
          const on = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.id)}
              className={cn(
                "inline-flex min-h-11 flex-none items-center gap-2 rounded-full border-0 px-4 text-sm font-medium whitespace-nowrap",
                on ? "bg-cta text-on-cta" : "bg-transparent text-ink-2",
              )}
            >
              <span>{option.label}</span>
              <span className="font-mono text-xs tabular-nums">
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className={MONO_LABEL}>
        {result}
      </p>
    </div>
  );
}
