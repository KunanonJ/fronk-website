import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { DitherField } from "@/components/ds/DitherField";
import { StatusDot } from "@/components/ds/labels";
import { cn } from "@/lib/utils/cn";

/*
 * The hero of the pages Phase 7 group D2 restyles (skills, a skill, the
 * résumé, the 404 and error pages, the hidden blog and press): the case
 * pages' pixel sky (design spec 9.2 and 6.8) with an optional back link or
 * breadcrumb above the eyebrow, the eyebrow after a status dot that pings
 * once, the h1 in the display serif, the lead, then the page's own parts.
 * It wears the core pages' hero classes (`.pf-page-hero*` in
 * src/styles/profile/cutover.css), so every page head looks the same; the
 * lane's additions are `.pf-cat-hero*` in pages-catalog.css. The h1 never
 * fades or moves (LCP, spec 13 item 3).
 */

/** Peach to the two lightest lavenders, dissolving downward, as on a case. */
const SKY = ["--peach", "--tint-3", "--tint-2"] as const;

export function CatalogHero({
  back,
  eyebrow,
  title,
  titleClassName,
  lead,
  children,
  className,
  ...rest
}: {
  /** A back link or a breadcrumb, above the eyebrow. */
  back?: ReactNode;
  eyebrow: ReactNode;
  /** The h1's content: words, or `Headline` lines. */
  title: ReactNode;
  titleClassName?: string;
  lead?: ReactNode;
  /** The page's own parts under the lead: pills, chips, a meta line. */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "title" | "children">) {
  return (
    <section
      className={cn("pf-page-hero pf-cat-hero", className)}
      aria-labelledby="hero-title"
      {...rest}
    >
      <div className="pf-page-hero__sky" aria-hidden="true">
        <DitherField stops={SKY} fade="down" seed={11} />
      </div>
      <div className="ds-wrap pf-page-hero__wrap">
        <div className="pf-page-hero__copy">
          {back ? <div className="pf-cat-hero__back">{back}</div> : null}
          <p className="t-meta pf-page-hero__eyebrow">
            <StatusDot />
            <span>{eyebrow}</span>
          </p>
          <h1
            id="hero-title"
            className={cn("t-display pf-page-hero__title", titleClassName)}
          >
            {title}
          </h1>
          {lead ? <p className="t-lead pf-page-hero__lead">{lead}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}
