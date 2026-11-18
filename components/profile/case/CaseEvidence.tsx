import Link from "@/components/navigation/Link";
import type { CaseEvidence as Evidence } from "@/lib/content/caseStudy";

/*
 * The evidence rows (profile redesign Phase 5, design spec 9.3): what changed,
 * then his part, each a full-width article above the cover, so a recruiter
 * reads them first. A project's rows are named "Outcome" and "My part" (the
 * smoke tests read both, and the link's exact name). A venture's figures take
 * the Outcome position, each with its month when it is a running total, and
 * its "My role" section takes the My part position. A case without the data
 * shows no row. Styles: `.pf-case-row*` in src/styles/profile/case.css.
 */
export function CaseEvidence({ evidence }: { evidence: Evidence }) {
  const { figures, part } = evidence;
  if (!figures && !part) return null;
  return (
    <div className="pf-case-evidence">
      {figures ? (
        <article className="pf-case-row" aria-labelledby="case-figures">
          <h2 id="case-figures" className="t-meta pf-case-row__head">
            {figures.heading}
          </h2>
          <div className="pf-case-row__body">
            <dl className="pf-case-figures">
              {figures.items.map((item) => (
                <div key={item.label} className="pf-case-figure">
                  <dt className="pf-case-figure__label">{item.label}</dt>
                  <dd className="pf-case-figure__value">{item.value}</dd>
                  {item.note ? (
                    <dd className="t-meta pf-case-figure__note">{item.note}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
            {figures.source ? (
              // The arrow stays in the name: a smoke test pins it (spec 12
              // item 18).
              <Link href={figures.source.href} className="ds-text-link">
                {figures.source.label}
              </Link>
            ) : null}
          </div>
        </article>
      ) : null}
      {part ? (
        <article className="pf-case-row" aria-labelledby="case-part">
          <h2 id="case-part" className="t-meta pf-case-row__head">
            {part.heading}
          </h2>
          <p className="pf-case-row__text">{part.text}</p>
        </article>
      ) : null}
    </div>
  );
}
