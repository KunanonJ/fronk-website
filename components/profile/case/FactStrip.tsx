import type { CaseFact } from "@/lib/content/caseStudy";

/*
 * A fact strip (profile redesign Phase 5, design spec 9.8): short facts in a
 * row between hairlines, each label in mono over its value. The problem's
 * before and after use it. Styles: `.pf-case-facts*` in case.css.
 */
export function FactStrip({ items }: { items: readonly CaseFact[] }) {
  return (
    <dl className="pf-case-facts">
      {items.map((item) => (
        <div key={item.label} className="pf-case-facts__item">
          <dt className="t-meta pf-case-facts__label">{item.label}</dt>
          <dd className="pf-case-facts__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
