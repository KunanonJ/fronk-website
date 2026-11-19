import { ArrowRight } from "lucide-react";
import { DitherField } from "@/components/ds/DitherField";
import { Chip } from "@/components/ds/labels";
import { CtaArrow, pillClass } from "@/components/ds/Pill";
import PortfolioMockup from "@/components/landing/portfolio/PortfolioMockup";
import Link from "@/components/navigation/Link";
import { morphFromCard } from "@/components/profile/case/caseMorph";
import { workCopy } from "@/lib/content/homeWorkAbout";
import type {
  StackArt,
  StackCardModel,
  StackMedia,
} from "@/lib/landing/stackCards";
import { cn } from "@/lib/utils/cn";

/*
 * One case of the work stack (profile redesign Phase 3, design spec 8.4 and
 * 6.12). An article named by its title, whose only link is the call to
 * action; the link's ::after covers the card, so the whole card opens the
 * case. The link's name is its visible label and the case's name. The media
 * repeats what the words say, so it is hidden from assistive technology; a
 * code-drawn picture wears a visible "Illustration" chip (owner decision 4).
 * Opening the case morphs the title and a venture's logo into its h1
 * (caseMorph.ts). Styles: `.pf-card*` in src/styles/profile/home-work-about.css.
 */

/**
 * Pixel colours for the card's dither, derived in CSS from its material. The
 * field is densest at the card's right edge (`fade="right"`: ditherCells
 * names the dense side for left and right) and, on phones, at its top.
 */
const SKY = ["--card-px-1", "--card-px-2"] as const;

function VentureArt({ art }: { art: Extract<StackArt, { type: "venture" }> }) {
  return (
    <div className="pf-venture-art">
      <img
        className="pf-venture-art__logo"
        src={art.logo}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
      />
      <ol className="pf-venture-art__steps">
        {art.steps.map((step, index) => (
          <li key={step} className="pf-venture-art__step">
            {art.loop && index > 0 ? (
              <ArrowRight
                className="pf-venture-art__arrow"
                size={14}
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : null}
            <span className="pf-venture-art__name">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Media({ media }: { media: StackMedia }) {
  return (
    <div className="pf-card__media" aria-hidden="true">
      <div className="pf-card__frame">
        {media.kind === "screenshot" ? (
          <img
            className="pf-card__shot"
            src={media.image.src}
            alt=""
            width={media.image.width}
            height={media.image.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <>
            <Chip kind="illustration">{workCopy.illustration}</Chip>
            {media.art.type === "mockup" ? (
              <PortfolioMockup mockup={media.art.mockup} labels="bars" />
            ) : (
              <VentureArt art={media.art} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function StackCard({
  card,
  index,
}: {
  card: StackCardModel;
  /** The card's place in the stack, which varies its dither. */
  index: number;
}) {
  const titleId = `stack-${card.slug}`;
  return (
    <article
      id={card.anchor}
      aria-labelledby={titleId}
      className={cn("pf-card ds-stretch-card", !card.media && "pf-card--text")}
      data-hue={card.hue}
      data-morph-card
    >
      <div className="pf-card__sky pf-card__sky--wide">
        <DitherField stops={SKY} fade="right" seed={index * 5} />
      </div>
      <div className="pf-card__sky pf-card__sky--tall">
        <DitherField stops={SKY} fade="down" seed={index * 5} />
      </div>
      <div className="pf-card__body">
        <ul className="pf-card__chips">
          {card.chips.map((chip) => (
            <li key={chip}>
              <Chip>{chip}</Chip>
            </li>
          ))}
        </ul>
        <h3 id={titleId} className="t-card-title pf-card__title">
          {card.name}
        </h3>
        <p className="pf-card__summary">{card.summary}</p>
        {card.evidence ? (
          <p className="pf-card__evidence">{card.evidence}</p>
        ) : null}
        {/* An explicit name: a visually hidden ": {name}" span is laid out
            as a block, and engines then name the link "Read the case
            study : TBH Intranet". The name keeps the visible label first
            (WCAG 2.5.3), also on phones where only the arrow shows. */}
        <Link
          href={card.href}
          className="ds-stretch pf-card__link"
          aria-label={`${workCopy.cta}: ${card.name}`}
          onClick={morphFromCard}
        >
          <span className={cn(pillClass(), "pf-card__cta")}>
            <span className="pf-card__cta-label">{workCopy.cta}</span>
            <CtaArrow />
          </span>
        </Link>
      </div>
      {card.media ? <Media media={card.media} /> : null}
    </article>
  );
}
