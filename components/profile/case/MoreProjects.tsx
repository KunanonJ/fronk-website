import { Chip } from "@/components/ds/labels";
import { CtaArrow, pillClass } from "@/components/ds/Pill";
import { TextLink } from "@/components/ds/TextLink";
import Link from "@/components/navigation/Link";
import { CaseMediaView } from "@/components/profile/case/CaseMedia";
import { caseCopy, type CaseMoreCard } from "@/lib/content/caseStudy";
import { cn } from "@/lib/utils/cn";

/*
 * More projects (profile redesign Phase 5, design spec 9.12 and 6.12): two
 * more cases as lift cards, then "All projects". Each card is an article
 * named by its title whose only link is the call to action; the link's
 * ::after covers the card. The picture repeats the title, so it is hidden
 * from assistive technology; a drawn one wears the "Illustration" chip. The
 * link is named by `aria-label`, its visible label first (WCAG 2.5.3), as the
 * Home's stack cards are. Styles: `.pf-case-more*`, `.pf-lift*` in case.css.
 */

function LiftCard({ card }: { card: CaseMoreCard }) {
  const titleId = `more-${card.slug}`;
  const drawn = card.media?.kind === "illustration";
  return (
    <article className="pf-lift ds-stretch-card" aria-labelledby={titleId}>
      <div
        className="pf-lift__mat"
        data-kind={card.media?.kind ?? "none"}
        data-hue={drawn ? card.hue : undefined}
        aria-hidden="true"
      >
        {card.media ? (
          <div className="pf-lift__media">
            <CaseMediaView media={card.media} variant="card" />
          </div>
        ) : null}
        {drawn ? (
          <Chip kind="illustration">{caseCopy.illustration}</Chip>
        ) : null}
      </div>
      <p className="t-meta pf-lift__meta">
        {card.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
      <h3 id={titleId} className="t-lift-title pf-lift__title">
        {card.name}
      </h3>
      <p className="t-small pf-lift__summary">{card.summary}</p>
      <Link
        href={card.href}
        className="ds-stretch pf-lift__link"
        aria-label={`${caseCopy.moreCta}: ${card.name}`}
      >
        <span className={cn(pillClass({ variant: "ghost", size: "sm" }))}>
          {caseCopy.moreCta}
          <CtaArrow />
        </span>
      </Link>
    </article>
  );
}

export function MoreProjects({ cards }: { cards: readonly CaseMoreCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="pf-case-more" aria-labelledby="case-more">
      <div className="ds-wrap">
        <div className="pf-case-more__inner">
          <div className="pf-case-more__head">
            <h2 id="case-more" className="t-h3">
              {caseCopy.more}
            </h2>
            <TextLink href={caseCopy.allProjects.href}>
              {caseCopy.allProjects.label}
            </TextLink>
          </div>
          <ul className="pf-case-more__grid">
            {cards.map((card) => (
              <li key={card.slug} className="pf-case-more__item">
                <LiftCard card={card} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
