import { DitherField } from "@/components/ds/DitherField";
import { StatusDot } from "@/components/ds/labels";
import { TextLink } from "@/components/ds/TextLink";
import Link from "@/components/navigation/Link";
import { CaseActions } from "@/components/profile/case/CaseActions";
import { CaseCover } from "@/components/profile/case/CaseCover";
import { CaseEvidence } from "@/components/profile/case/CaseEvidence";
import { CaseMeta } from "@/components/profile/case/CaseMeta";
import { useMorphTarget } from "@/components/profile/case/caseMorph";
import { caseCopy, type CaseStudy } from "@/lib/content/caseStudy";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { caseWords, readingMinutes } from "@/lib/content/readingTime";

/*
 * The case hero (profile redesign Phase 5, design spec 9.1 to 9.5): the pixel
 * sky, the back link, the eyebrow, the h1, the lead and the pills, then the
 * evidence rows, the cover and the meta row. The h1 holds today's text (R12):
 * the name as the display line and the tagline as a smaller line inside it,
 * with a literal space between, so it reads "{name}. {tagline}" for a project
 * and "{name} {tagline}" for a venture. It never fades or moves (LCP),
 * except inside a page transition from a case card: the card's title and logo
 * then morph into the name and the logo (caseMorph.ts). The eyebrow ends with
 * the reading time, counted from the case's own words (readingTime.ts).
 * Styles: `.pf-case-hero*` in src/styles/profile/case.css.
 */

/**
 * The case sky: peach to lavender, dissolving downward (spec 6.8). The two
 * lightest lavenders, since the eyebrow and the h1 sit on it.
 */
const SKY = ["--peach", "--tint-3", "--tint-2"] as const;

export function CaseHero({ study }: { study: CaseStudy }) {
  const morph = useMorphTarget(study.href);
  return (
    <section className="pf-case-hero" aria-labelledby="hero-title">
      <div className="pf-case-hero__sky" aria-hidden="true">
        <DitherField stops={SKY} fade="down" seed={7} />
      </div>
      <div className="ds-wrap pf-case-hero__wrap">
        <div className="pf-case-hero__back">
          <TextLink href={study.back.href} arrow="left">
            {study.back.label}
          </TextLink>
        </div>
        <p className="t-meta pf-case-hero__eyebrow">
          <StatusDot />
          <span>
            {study.eyebrow}{" "}
            {caseCopy.readingTime(readingMinutes(caseWords(study)))}
          </span>
        </p>
        <h1
          id="hero-title"
          className="t-display pf-case-hero__title"
          data-morph={morph ? "" : undefined}
        >
          {study.logo ? (
            <img
              className="pf-case-hero__logo"
              src={study.logo}
              alt=""
              width={64}
              height={64}
              decoding="async"
            />
          ) : null}
          <span className="pf-case-hero__name">{study.titleName}</span>{" "}
          <span className="pf-case-hero__tagline">{study.tagline}</span>
        </h1>
        <p className="t-lead pf-case-hero__lead">
          {keepNamesWhole(study.lead)}
        </p>
        {study.byline ? (
          <p className="t-small pf-case-hero__byline">
            {caseCopy.byline}{" "}
            <Link
              href={study.byline.author.href}
              rel="author"
              className="ds-prose-link"
            >
              {study.byline.author.label}
            </Link>{" "}
            · {study.byline.role}
          </p>
        ) : null}
        <CaseActions external={study.external} />
        <CaseEvidence evidence={study.evidence} />
        {study.cover ? <CaseCover media={study.cover} hue={study.hue} /> : null}
        <CaseMeta meta={study.meta} />
      </div>
    </section>
  );
}
