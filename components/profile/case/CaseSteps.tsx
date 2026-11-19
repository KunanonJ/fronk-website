import { useId } from "react";
import { pad2 } from "@/lib/utils/pad2";

/*
 * Steps (profile redesign Phase 5, design spec 9.13): a workflow or a loop as
 * numbered cards in order, under its name in mono. Four to a row from
 * 1024 px, two from 600 px, one below. Styles: `.pf-case-steps*` in case.css.
 */
export function CaseSteps({
  label,
  steps,
}: {
  label: string;
  steps: readonly { label: string; detail?: string }[];
}) {
  const id = useId();
  return (
    <div className="pf-case-steps">
      <p id={id} className="t-meta pf-case-steps__name">
        {label}
      </p>
      <ol aria-labelledby={id} className="pf-case-steps__list">
        {steps.map((step, index) => (
          <li key={step.label} className="pf-case-steps__item">
            <span className="t-meta pf-case-steps__number" aria-hidden="true">
              {pad2(index + 1)}
            </span>
            <span className="pf-case-steps__label">{step.label}</span>
            {step.detail ? (
              <span className="pf-case-steps__detail">{step.detail}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
