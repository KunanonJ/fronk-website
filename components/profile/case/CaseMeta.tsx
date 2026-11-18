import type { CaseFact } from "@/lib/content/caseStudy";

/*
 * The meta row (profile redesign Phase 5, design spec 9.5): Role,
 * Organisation, Period and Access for a project; Role, Started, Status and
 * Offer for a venture. Two columns, four from 1024 px, under a hairline.
 * Styles: `.pf-case-meta*` in src/styles/profile/case.css.
 */
export function CaseMeta({ meta }: { meta: readonly CaseFact[] }) {
  return (
    <dl className="pf-case-meta">
      {meta.map((item) => (
        <div key={item.label} className="pf-case-meta__item">
          <dt className="t-meta pf-case-meta__label">{item.label}</dt>
          <dd className="t-meta-value pf-case-meta__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
