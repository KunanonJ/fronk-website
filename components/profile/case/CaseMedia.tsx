import { ArrowRight } from "lucide-react";
import PortfolioMockup from "@/components/landing/portfolio/PortfolioMockup";
import type { CaseArt, CaseMedia } from "@/lib/content/caseStudy";

/*
 * A case's picture (profile redesign Phase 5, design spec 9.4 and 9.12): a
 * registered screenshot, or a code-drawn illustration. The cover shows it
 * large; a More projects card shows it small. Text drawn inside renders at
 * 12 px or more, or is drawn as bars (spec 12 item 5): the project mockup's
 * SVG writes its labels of 12 units or more only from 810 px, where the cover
 * draws it at its full size or larger, and draws bars below that and on cards.
 * Styles: `.pf-case-art*` in src/styles/profile/case.css.
 */

/** A venture's logo over its loop's stages, or its categories. */
function VentureDrawing({
  art,
}: {
  art: Extract<CaseArt, { type: "venture" }>;
}) {
  return (
    <div className="pf-case-venture">
      <img
        className="pf-case-venture__logo"
        src={art.logo}
        alt=""
        width={72}
        height={72}
        loading="lazy"
        decoding="async"
      />
      <ol className="pf-case-venture__steps">
        {art.steps.map((step, index) => (
          <li key={step} className="pf-case-venture__step">
            {art.loop && index > 0 ? (
              <ArrowRight
                className="pf-case-venture__arrow"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : null}
            <span className="pf-case-venture__name">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Drawing({ art, cover }: { art: CaseArt; cover: boolean }) {
  if (art.type === "venture") return <VentureDrawing art={art} />;
  if (!cover) return <PortfolioMockup mockup={art.mockup} labels="bars" />;
  // Two drawings, one shown per width: the wrappers carry the switch, since
  // the SVG's own `block` utility would beat a component rule.
  return (
    <>
      <div className="pf-case-art__wide">
        <PortfolioMockup mockup={art.mockup} labels="floor" />
      </div>
      <div className="pf-case-art__narrow">
        <PortfolioMockup mockup={art.mockup} labels="bars" />
      </div>
    </>
  );
}

export function CaseMediaView({
  media,
  variant,
}: {
  media: CaseMedia;
  /** cover: the page's cover, loaded at once. card: a More projects card. */
  variant: "cover" | "card";
}) {
  const cover = variant === "cover";
  if (media.kind === "screenshot") {
    const { image } = media;
    return (
      <img
        className="pf-case-art__shot"
        src={image.src}
        // One registered width today; more join the list as they are added.
        srcSet={cover ? `${image.src} ${image.width}w` : undefined}
        sizes={cover ? "(max-width: 1360px) 100vw, 1360px" : undefined}
        alt={cover ? image.alt : ""}
        width={image.width}
        height={image.height}
        loading={cover ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <div
      className="pf-case-art"
      data-art={media.art.type}
      // The card's title says the same, so the card's picture is decorative.
      role={cover ? "img" : undefined}
      aria-label={cover ? media.label : undefined}
    >
      <Drawing art={media.art} cover={cover} />
    </div>
  );
}
