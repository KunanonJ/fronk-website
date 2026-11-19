import { Fragment, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { DitherField } from "@/components/ds/DitherField";
import { StatusDot } from "@/components/ds/labels";
import type { HeadlineLines } from "@/lib/content/corePages";
import { cn } from "@/lib/utils/cn";

/*
 * The hero of every page without its own (the portfolio index, About,
 * Contact, skills, a skill, the résumé, the status pages, /design, the
 * hidden blog and press): the case pages' pixel sky (design spec 9.2 and
 * 6.8), an optional back link or breadcrumb, the eyebrow after a status dot
 * that pings once, the h1 in the display serif, the lead, then the page's
 * own parts (pills, filters, a meta line), with an optional picture beside
 * the copy. The h1 never fades or moves (LCP, spec 13 item 3). Styles:
 * `.pf-page-hero*` in src/styles/profile/cutover.css.
 */

/** Peach to the two lightest lavenders, dissolving downward, as on a case. */
const SKY = ["--peach", "--tint-3", "--tint-2"] as const;

/**
 * An h1's lines. Lines are blocks and their parts are joined by literal
 * spaces, so the h1's text reads as one sentence, word for word the live
 * page's (the parity gate strips the tags): muted words in `--muted`, the
 * accent in the italic serif.
 */
function Headline({ lines }: { lines: HeadlineLines }) {
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      <span className="pf-page-hero__line">
        {line.map((part, at) => (
          <Fragment key={at}>
            {at > 0 ? " " : null}
            {part.tone ? (
              <span className={`pf-page-hero__${part.tone}`}>{part.text}</span>
            ) : (
              part.text
            )}
          </Fragment>
        ))}
      </span>
    </Fragment>
  ));
}

/** The h1's content: Headline lines, or anything else. */
type HeroTitle =
  { lines: HeadlineLines; title?: never } | { lines?: never; title: ReactNode };

export function PageHero({
  back,
  eyebrow,
  lines,
  title,
  titleClassName,
  lead,
  children,
  aside,
  className,
  ...rest
}: HeroTitle & {
  /** A back link or a breadcrumb, above the eyebrow. */
  back?: ReactNode;
  eyebrow: ReactNode;
  titleClassName?: string;
  lead?: ReactNode;
  /** The page's own parts under the lead: pills, an availability line. */
  children?: ReactNode;
  /** A picture beside the copy from 1024 px (About's portrait). */
  aside?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "title" | "children">) {
  return (
    <section
      className={cn(
        "pf-page-hero",
        aside ? "pf-page-hero--aside" : null,
        className,
      )}
      aria-labelledby="hero-title"
      {...rest}
    >
      <div className="pf-page-hero__sky" aria-hidden="true">
        <DitherField stops={SKY} fade="down" seed={11} />
      </div>
      <div className="ds-wrap pf-page-hero__wrap">
        <div className="pf-page-hero__copy">
          {back ? <div className="pf-page-hero__back">{back}</div> : null}
          <p className="t-meta pf-page-hero__eyebrow">
            <StatusDot />
            <span>{eyebrow}</span>
          </p>
          <h1
            id="hero-title"
            className={cn("t-display pf-page-hero__title", titleClassName)}
          >
            {lines ? <Headline lines={lines} /> : title}
          </h1>
          {lead ? <p className="t-lead pf-page-hero__lead">{lead}</p> : null}
          {children}
        </div>
        {aside ? <div className="pf-page-hero__aside">{aside}</div> : null}
      </div>
    </section>
  );
}
