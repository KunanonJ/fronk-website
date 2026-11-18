import { TextLink } from "@/components/ds/TextLink";
import { OPEN_TO_ROLES, RESUME_PDF_NAME } from "@/lib/content/availability";
import type { RecruiterLink } from "@/lib/content/contact";
import { place } from "@/lib/content/landing";

/*
 * What a recruiter asks first, answered before they write (recruiter-fit
 * phase 2), in the profile redesign's style since the Phase 6 cutover: About
 * shows it in its "Next" card, Contact in "For recruiters". Only what the
 * owner approved appears: the availability line and where he is.
 */

/** Who he is open to hearing from, then his time zone. */
export function RecruiterLines() {
  return (
    <>
      <p className="t-body pf-recruit__line">{OPEN_TO_ROLES.sentence}</p>
      <p className="t-small pf-recruit__time">
        {place.city} time, {place.utcLabel}.
      </p>
    </>
  );
}

/**
 * The links under those lines, arrows hidden from the link names (spec 12
 * item 18). The résumé file downloads under a findable name; a profile on
 * another site opens in a new tab.
 */
export function RecruiterLinks({ links }: { links: readonly RecruiterLink[] }) {
  return (
    <ul className="pf-recruit__links">
      {links.map((link) => (
        <li key={link.href}>
          {link.download ? (
            <a
              href={link.href}
              download={RESUME_PDF_NAME}
              className="ds-text-link"
            >
              <span>{link.label}</span>
              <span className="ds-text-link__arrow" aria-hidden="true">
                ↓
              </span>
            </a>
          ) : (
            <TextLink
              href={link.href}
              external={link.external}
              arrow={link.external ? "up-right" : "right"}
            >
              {link.label}
            </TextLink>
          )}
        </li>
      ))}
    </ul>
  );
}
