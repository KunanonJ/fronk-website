import { Fragment, type ReactNode } from "react";
import { DitherField } from "@/components/ds/DitherField";
import { StatusDot } from "@/components/ds/labels";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import type { HeadlineLine } from "@/lib/content/topics/pillars";
import { cn } from "@/lib/utils/cn";

/*
 * The hero of a topic hub and of a reading page (/learn, /examples, /stack,
 * /proof, /build; profile redesign, Phase 7 lane D1, plan steps 7a and 7d):
 * Phase 6's page hero (`.pf-page-hero*` in src/styles/profile/cutover.css),
 * the case pages' pixel sky, the eyebrow after a status dot, the h1 in the
 * display serif and the lead, with the h1 drawn from the content's own
 * segments. The h1 never fades or moves (LCP, design spec 13 item 3).
 */

/** Peach to the two lightest lavenders, dissolving downward, as on a case. */
const SKY = ["--peach", "--tint-3", "--tint-2"] as const;

/**
 * An h1 as its content module draws it: one block per line, connector words
 * muted, the last line the italic accent. The segments are written out as
 * the module holds them, so the h1's text stays word for word (the parity
 * gate reads it). `joiner` goes between lines: nothing for the topic hubs,
 * whose segments carry their own spaces (Thai runs words together), a space
 * for the reading pages.
 */
export function SegmentHeadline({
  lines,
  joiner,
}: {
  lines: readonly HeadlineLine[];
  joiner: "" | " ";
}) {
  const last = lines.length - 1;
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? joiner : null}
      <span
        className={cn(
          "pf-page-hero__line",
          index === last && index > 0 && "pf-page-hero__accent",
        )}
      >
        {line.map((segment, at) =>
          typeof segment === "string" ? (
            <Fragment key={at}>{segment}</Fragment>
          ) : (
            <span key={at} className="pf-page-hero__muted">
              {segment.muted}
            </span>
          ),
        )}
      </span>
    </Fragment>
  ));
}

export function ReadingHero({
  eyebrow,
  title,
  lead,
  aside,
  children,
}: {
  eyebrow: string;
  /** The h1's content, usually a SegmentHeadline. */
  title: ReactNode;
  /** A string keeps its names unbroken (keepWhole.ts). */
  lead?: ReactNode;
  /** A control beside the eyebrow: the hubs' language switch. */
  aside?: ReactNode;
  /** The page's own parts under the lead: pills, chips. */
  children?: ReactNode;
}) {
  const eyebrowRow = (
    <p className="t-meta pf-page-hero__eyebrow">
      <StatusDot />
      <span>{eyebrow}</span>
    </p>
  );
  return (
    <section className="pf-page-hero" aria-labelledby="hero-title">
      <div className="pf-page-hero__sky" aria-hidden="true">
        <DitherField stops={SKY} fade="down" seed={13} />
      </div>
      <div className="ds-wrap pf-page-hero__wrap">
        <div className="pf-page-hero__copy">
          {aside ? (
            <div className="pf-read-hero__top">
              {eyebrowRow}
              {aside}
            </div>
          ) : (
            eyebrowRow
          )}
          <h1 id="hero-title" className="t-display pf-page-hero__title">
            {title}
          </h1>
          {lead ? (
            <p className="t-lead pf-page-hero__lead">
              {typeof lead === "string" ? keepNamesWhole(lead) : lead}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
