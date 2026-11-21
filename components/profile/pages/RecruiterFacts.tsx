import { TextLink } from "@/components/ds/TextLink";
import { AVAILABILITY, RESUME_PDF_NAME } from "@/lib/content/availability";
import type { RecruiterLink } from "@/lib/content/contact";
import { place } from "@/lib/content/landing";

/*
 * What a recruiter asks first, answered before they write (recruiter-fit
 * phase 2), in the profile redesign's style since the Phase 6 cutover:
 * Contact shows it in "For recruiters", About in its "Next" card without
 * the availability line, which About's Now section states (UX sweep
 * 21-11-26). Only what the owner directed appears: the availability line
 * (20-11-26: not looking for a full-time role now) and where the owner is.
 */

/**
 * What the owner is doing and whether they are looking, then their time
 * zone; with `availability={false}`, the time zone only (About's Next card).
 */
export function RecruiterLines({
  availability = true,
}: {
  availability?: boolean;
}) {
  return (
    <>
      {availability ? (
        <p className="t-body pf-recruit__line">{AVAILABILITY.sentence}</p>
      ) : null}
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
