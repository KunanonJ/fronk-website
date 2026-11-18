import { DitherField } from "@/components/ds/DitherField";
import { TextLink } from "@/components/ds/TextLink";
import { recordsCopy } from "@/lib/content/homeJourney";
import { careerRecords, type RecordRow } from "@/lib/landing/journey";

/*
 * The Journey's records card (profile redesign Phase 4, design spec 8.6):
 * the newest roles and the education from the résumé
 * (resumeTimeline.fallback.ts, read through lib/landing/journey.ts), each row
 * the organisation, its period without an em dash, and the title; a link to
 * the full résumé; a dither floor along the bottom edge.
 */

function Rows({ rows }: { rows: readonly RecordRow[] }) {
  return (
    <ol className="pf-records__list">
      {rows.map((row) => (
        <li key={row.key} className="pf-records__row">
          <span className="pf-records__org">{row.organisation}</span>
          <span className="pf-records__when">{row.period}</span>
          <span className="pf-records__role">{row.title}</span>
        </li>
      ))}
    </ol>
  );
}

export function RecordsCard() {
  const { employment, education } = careerRecords();
  return (
    <aside className="pf-records" aria-label={recordsCopy.label}>
      <div className="pf-records__group">
        <h3 className="t-meta pf-records__heading">{recordsCopy.employment}</h3>
        <Rows rows={employment} />
      </div>
      <div className="pf-records__group">
        <h3 className="t-meta pf-records__heading">{recordsCopy.education}</h3>
        <Rows rows={education} />
      </div>
      <p className="pf-records__more">
        <TextLink href={recordsCopy.resume.href}>
          {recordsCopy.resume.label}
        </TextLink>
      </p>
      <div className="pf-records__floor" aria-hidden="true">
        <DitherField stops={["--tint-4", "--tint-3"]} cell={8} fade="up" />
      </div>
    </aside>
  );
}
