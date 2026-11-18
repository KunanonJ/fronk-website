import type { ReactNode } from "react";
import { EyebrowRow } from "@/components/ds/labels";
import { cn } from "@/lib/utils/cn";

/*
 * A Home section's header (profile redesign Phase 3, design spec 8.4 and
 * 8.5; reused by later sections): a mono eyebrow with its hairline, the serif
 * h2, and a one-line lead. From 810 px the lead sits on the right, on the
 * h2's last baseline; under 810 px it sits under the h2. The centred form
 * (the notebook, spec 8.7) draws hairlines on both sides of the eyebrow and
 * centres everything. Styles: `.pf-section-head*` in
 * src/styles/profile/home-work-about.css.
 */

export interface SectionHeaderProps {
  /** The mono label above the h2, such as "Selected work". */
  eyebrow: string;
  /**
   * An id for the eyebrow, so the section or article can take its name from
   * it (`aria-labelledby`). The work stack is named "Selected work" this way.
   */
  eyebrowId?: string;
  /** The h2's text, set in the serif `t-title` size. */
  title: ReactNode;
  /** An id for the h2. */
  titleId?: string;
  /** One short line beside or under the h2, in ink 60. Optional. */
  lead?: ReactNode;
  /**
   * The h2's measure in `ch`, so a long title breaks into lines on purpose:
   * 13 by default; the spec sets 10 for About and 9 for Journey.
   */
  titleMaxWidth?: number;
  /** "split" (default): lead on the right. "centred": all centred. */
  align?: "split" | "centred";
  /**
   * The eyebrow's hairline (true by default). False sets the eyebrow as a
   * plain mono label, for a header that floats over art, such as the
   * Journey's stage (Phase 4, spec 8.6).
   */
  rule?: boolean;
  /** The lead's type style: `t-body` (default), or `t-lead` (the Journey). */
  leadSize?: "body" | "lead";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  eyebrowId,
  title,
  titleId,
  lead,
  titleMaxWidth = 13,
  align = "split",
  rule = true,
  leadSize = "body",
  className,
}: SectionHeaderProps) {
  const centred = align === "centred";
  return (
    <div
      className={cn(
        "pf-section-head",
        centred && "pf-section-head--centred",
        className,
      )}
    >
      {rule ? (
        <EyebrowRow id={eyebrowId} centred={centred}>
          {eyebrow}
        </EyebrowRow>
      ) : (
        <p id={eyebrowId} className="t-meta text-ink-2">
          {eyebrow}
        </p>
      )}
      <div className="pf-section-head__row">
        <h2
          id={titleId}
          className="t-title pf-section-head__title"
          style={{ maxInlineSize: `${titleMaxWidth}ch` }}
        >
          {title}
        </h2>
        {lead ? (
          <p
            className={
              leadSize === "lead"
                ? "t-lead pf-section-head__lead"
                : "t-body pf-section-head__lead"
            }
          >
            {lead}
          </p>
        ) : null}
      </div>
    </div>
  );
}
