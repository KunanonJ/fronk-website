import { CardLink } from "@/components/bento/Bento";
import { OPEN_TO_ROLES, RESUME_PDF_NAME } from "@/lib/content/availability";
import type { RecruiterLink } from "@/lib/content/contact";
import { place } from "@/lib/content/landing";
import { cn } from "@/lib/utils/cn";

/*
 * What a recruiter asks first, answered before they write. Contact shows it
 * in its own card and About in "Let's talk" (recruiter-fit phase 2). Only
 * what the owner has approved appears: the availability line and where he
 * is. Notice period and work authorization are not on the site.
 */

/** The card text link's look, for the two anchors the router must not handle. */
const LINK =
  "inline-flex min-h-11 items-center text-sm font-medium no-underline";

/** Who he is open to hearing from, then his time zone. */
export function RecruiterLines() {
  return (
    <>
      <p className="m-0 px-1 text-card leading-[1.5] font-medium">
        {OPEN_TO_ROLES.sentence}
      </p>
      <p className="m-0 px-1 text-meta leading-[1.5] text-ink-2">
        {place.city} time, {place.utcLabel}.
      </p>
    </>
  );
}

/**
 * The links under those lines. The résumé file downloads under a findable
 * name; a profile on another site opens in a new tab, as in "Elsewhere".
 */
export function RecruiterLinks({
  links,
  className,
}: {
  links: readonly RecruiterLink[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col px-1", className)}>
      {links.map((link) =>
        link.download ? (
          <a
            key={link.href}
            href={link.href}
            download={RESUME_PDF_NAME}
            className={LINK}
          >
            {link.label} →
          </a>
        ) : link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="me noopener noreferrer"
            className={LINK}
          >
            {link.label} →
          </a>
        ) : (
          <CardLink key={link.href} href={link.href}>
            {link.label} →
          </CardLink>
        ),
      )}
    </div>
  );
}
