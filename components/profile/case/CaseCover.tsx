import { CaseMediaView } from "@/components/profile/case/CaseMedia";
import { caseCopy, type CaseMedia } from "@/lib/content/caseStudy";
import type { MaterialHue } from "@/lib/landing/stackCards";

/*
 * The cover (profile redesign Phase 5, design spec 9.4): `article "Interface"`
 * holding a figure. A screenshot keeps its registered ratio on the paper-2
 * backing; a code-drawn picture sits at 16:10 on the case's material, with a
 * caption that starts with "Illustration" (owner decision 4). Not clickable,
 * no zoom. Under 720 px it bleeds to 12 px from the screen's edges.
 * Styles: `.pf-case-cover*` in src/styles/profile/case.css.
 */
export function CaseCover({
  media,
  hue,
}: {
  media: CaseMedia;
  hue: MaterialHue;
}) {
  const shot = media.kind === "screenshot";
  return (
    <article className="pf-case-cover" aria-label={caseCopy.interface}>
      <figure className="pf-case-cover__figure">
        <div
          className="pf-case-cover__frame"
          data-kind={media.kind}
          data-hue={shot ? undefined : hue}
          style={
            shot
              ? {
                  aspectRatio: `${media.image.width} / ${media.image.height}`,
                }
              : undefined
          }
        >
          <CaseMediaView media={media} variant="cover" />
        </div>
        {shot ? null : (
          <figcaption className="pf-case-cover__caption">
            {caseCopy.coverCaption}
          </figcaption>
        )}
      </figure>
    </article>
  );
}
