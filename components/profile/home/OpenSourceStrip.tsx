import { DaysAgo } from "@/components/ds/DaysAgo";
import { Pill } from "@/components/ds/Pill";
import Link from "@/components/navigation/Link";
import { PixelBadge } from "@/components/profile/home/PixelIcon";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import {
  OPEN_SOURCE_PROJECTS,
  openSourceStrip,
} from "@/lib/content/openSource";

/*
 * Home's open-source strip, `section#open-source` (21-11-26, owner request):
 * after the Journey's story and before the notebook, a smaller section
 * header with a pill to /open-source, then a tile per project that opens its
 * card there. Not a nav section: over it the scrollspy marks nothing, as
 * over the hero. Styles: `.pf-oss*` in src/styles/profile/home-hero.css
 * (Home's own sheet); the badge is the Journey's, the tag mark and code are
 * the catalog's.
 */
export default function OpenSourceStrip() {
  return (
    <section
      id="open-source"
      aria-labelledby="oss-title"
      className="pf-oss ds-wrap"
    >
      <SectionHeader
        eyebrow={openSourceStrip.eyebrow}
        title={openSourceStrip.heading}
        titleId="oss-title"
        titleClassName="pf-oss__title"
        lead={openSourceStrip.lead}
        actions={
          <Pill href="/open-source" variant="ghost" size="sm">
            {openSourceStrip.cta}
          </Pill>
        }
      />
      <ul className="pf-oss__list">
        {OPEN_SOURCE_PROJECTS.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/open-source#${project.slug}`}
              className="ds-tile pf-oss__tile"
            >
              <PixelBadge
                badge={project.badge}
                tone={project.tone}
                className="pf-oss__badge"
              />
              <span className="pf-oss__text">
                <span className="t-lift-title pf-oss__name">
                  {project.name}
                </span>
                <span className="t-small text-ink-2">{project.kind}</span>
                <span className="pf-oss__meta">
                  {project.facts.release ? (
                    <>
                      <span aria-hidden="true" className="pf-skill-tag__mark" />
                      <span className="pf-cat-code">
                        {project.facts.release.tag}
                      </span>
                    </>
                  ) : null}
                  <span className="t-small text-ink-2">
                    {openSourceStrip.updated}{" "}
                    <DaysAgo iso={project.facts.lastCommitAt} />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
