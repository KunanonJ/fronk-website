import type { ReactNode } from "react";
import { PixelMark } from "@/components/ds/labels";
import Link from "@/components/navigation/Link";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * Shared parts of the reading pages (/learn, /examples, /stack, /proof,
 * /build; profile redesign, Phase 7 lane D1, plan step 7d): a block's kicker
 * and count, the filter bar of the portfolio index, and a text link that can
 * name its language or open a new tab. Styles: `.pf-read*` in
 * src/styles/profile/pages-hubs.css, `.pf-work__*` in cutover.css.
 */

/** "03 tools", "01 ticket". */
export function countLabel(n: number, one: string, many: string): string {
  return `${pad2(n)} ${n === 1 ? one : many}`;
}

/**
 * A block's header: the kicker (the pixel mark, or the block's own marker,
 * then its name) as the block's heading, and a count or note on the right.
 */
export function BlockHead({
  id,
  title,
  marker,
  note,
  live = false,
  level = 2,
}: {
  id: string;
  title: ReactNode;
  /** A class for a square of the block's own colour, in place of the mark. */
  marker?: string;
  note?: ReactNode;
  /** The note reports a filter's result: a screen reader hears it change. */
  live?: boolean;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="pf-read-head">
      <Heading id={id} className="t-kicker pf-case-kicker">
        {marker ? (
          <span aria-hidden="true" className={cn("pf-read-marker", marker)} />
        ) : (
          <PixelMark />
        )}
        <span>{title}</span>
      </Heading>
      {note ? (
        <p
          aria-live={live ? "polite" : undefined}
          className="t-meta text-ink-2"
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

export type FilterOption<T extends string> = {
  id: T;
  label: string;
  /** Shown after the label; the language switch has none. */
  count?: number;
  /** A short code drawn after the label and not read ("EN", "TH"). */
  code?: string;
  /** The label's language, when not the page's. */
  lang?: string;
};

/**
 * The filter bar (Stack, Build, Learn): the portfolio index's
 * pressed pills on one paper track, and a polite result line. The value is a
 * URL search param owned by the route.
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
    <div className="pf-work__bar">
      <div role="group" aria-label={label} className="pf-work__filter">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === value}
            onClick={() => onChange(option.id)}
            className="pf-work__option"
          >
            <span lang={option.lang}>{option.label}</span>
            {option.count === undefined ? null : (
              <>
                {" "}
                <span className="pf-read-count">{option.count}</span>
              </>
            )}
            {option.code ? (
              <>
                {" "}
                <span className="pf-read-count" aria-hidden="true">
                  {option.code}
                </span>
              </>
            ) : null}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="t-meta pf-work__count">
        {result}
      </p>
    </div>
  );
}

/**
 * A text link with its arrow drawn, not read (design spec 12 item 18). It can
 * name its language and the target's (`lang`, `hrefLang`), or open a new tab
 * and say so (spec 12 item 17).
 */
export function ArrowLink({
  href,
  children,
  lang,
  hrefLang,
  external = false,
  label,
}: {
  href: string;
  children: ReactNode;
  lang?: string;
  hrefLang?: string;
  external?: boolean;
  /** A fuller name than the words shown, when they repeat on the page. */
  label?: string;
}) {
  const newTab = external ? { target: "_blank", rel: "noopener" } : {};
  return (
    <Link
      href={href}
      lang={lang}
      hrefLang={hrefLang}
      aria-label={label}
      className="ds-text-link pf-read-link"
      {...newTab}
    >
      <span>
        {children}
        {external ? (
          <>
            {" "}
            <span className="sr-only">(opens in a new tab)</span>
          </>
        ) : null}
      </span>
      <span className="ds-text-link__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
