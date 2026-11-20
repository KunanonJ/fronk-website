import { useEffect, useRef, useState } from "react";
import Link from "@/components/navigation/Link";
import { CheckIcon, CopyIcon, DownloadIcon } from "@/components/bento/icons";
import { CompanyLogo } from "@/components/CompanyLogo";
import { StatusDot } from "@/components/ds/labels";
import { pillClass } from "@/components/ds/Pill";
import { TextLink } from "@/components/ds/TextLink";
import { LocalTime } from "@/components/profile/site/LocalTime";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { PORTRAIT } from "@/lib/brand/pixelPortrait";
import {
  RESUME_PDF_HREF,
  RESUME_PDF_NAME,
  WORK_CONTACT_HREF,
} from "@/lib/content/availability";
import { contactPage } from "@/lib/content/contact";
import { place } from "@/lib/content/landing";
import type { ResolvedTimelineSection } from "@/lib/content/resumeProfile";
import { siteConfig } from "@/lib/site";
import { writeClipboard } from "@/lib/utils/clipboard";

/*
 * The résumé's facts card ("Snapshot", now-building program phase 2): what a
 * recruiter looks for first, beside the h1 from 1024 px and under it on
 * phones. The pixel portrait (decorative), Download PDF and Contact, then
 * what he is building (the "Currently" section's entries, so a Sanity
 * résumé flows through, and the row goes when the section does), where he
 * is with the time there, and how to reach him: the address with Copy, and
 * LinkedIn and GitHub. Screen only: the hero is hidden in print. Styles:
 * `.pf-resume-card*` in src/styles/resume.css.
 */

/** New wording on this card, for the owner's review. */
const COPY = {
  label: "At a glance", // DRAFT
  building: "Building", // DRAFT
  based: "Based", // DRAFT
  contact: "Contact", // DRAFT
  copied: "Email copied", // DRAFT
} as const;

type CopyStatus = "idle" | "copied" | "failed";

/** How long "Copied" stays before the button reads "Copy" again. */
const COPY_RESET_MS = 2000;

/**
 * Copy for the address: the pill reads "Copied" for two seconds, and a
 * polite live region says what happened. Its own small button, not the
 * skills pages' CopyButton: sharing that one split it into a chunk of its
 * own on every skill page.
 */
function CopyEmail() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    const ok = await writeClipboard(siteConfig.email);
    setStatus(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), COPY_RESET_MS);
  };
  return (
    <>
      <button
        type="button"
        aria-label={contactPage.copyEmail}
        data-status={status}
        onClick={() => void copy()}
        className={`${pillClass({ variant: "ghost", size: "sm" })} pf-resume-card__copy`}
      >
        <span className="ds-pill__icon" aria-hidden="true">
          {status === "copied" ? (
            <CheckIcon size={14} />
          ) : (
            <CopyIcon size={14} />
          )}
        </span>
        <span aria-hidden="true">
          {status === "copied" ? contactPage.emailCopied : "Copy"}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? COPY.copied
          : status === "failed"
            ? "Copy failed"
            : ""}
      </span>
    </>
  );
}

/** A venture he is building: its logo and name, linked to its page here. */
function Venture({ item }: { item: ResolvedTimelineSection["items"][number] }) {
  const body = (
    <>
      {/* In the first screen at every width but the smallest: not lazy. */}
      <CompanyLogo
        name={item.logoName ?? item.title}
        domain={item.logoDomain}
        src={item.logoSrc}
        size={24}
        loading="eager"
      />
      <span>{item.title}</span>
    </>
  );
  return item.more ? (
    <Link href={item.more.href} className="pf-resume-card__venture">
      {body}
    </Link>
  ) : (
    <span className="pf-resume-card__venture">{body}</span>
  );
}

export function ResumeSnapshot({
  name,
  now,
}: {
  name: string;
  /** The "Currently" section, when the résumé has one. */
  now?: ResolvedTimelineSection;
}) {
  return (
    <section aria-labelledby="resume-snapshot" className="pf-resume-card">
      <div className="pf-resume-card__top">
        <PixelPortrait rows={PORTRAIT} className="pf-resume-card__portrait" />
        <div>
          <h2 id="resume-snapshot" className="t-meta pf-resume-card__label">
            {COPY.label}
          </h2>
          <p className="pf-resume-card__name">{name}</p>
        </div>
      </div>

      <div className="pf-resume-card__actions">
        <a
          href={RESUME_PDF_HREF}
          download={RESUME_PDF_NAME}
          className={pillClass({ size: "lg" })}
        >
          <span className="ds-pill__icon" aria-hidden="true">
            <DownloadIcon />
          </span>
          <span>Download PDF</span>
        </a>
        <Link
          href={WORK_CONTACT_HREF}
          className={pillClass({ variant: "ghost", size: "lg" })}
        >
          Contact
        </Link>
      </div>

      <dl className="pf-resume-card__facts">
        {now && now.items.length > 0 ? (
          <div className="pf-resume-card__fact">
            <dt className="t-meta pf-resume-card__term">
              {/* The live dot pings once (no-preference only), then rests. */}
              <StatusDot />
              {COPY.building}
            </dt>
            <dd>
              <ul className="pf-resume-card__ventures">
                {now.items.map((item) => (
                  <li key={`${item.title}-${item.org}`}>
                    <Venture item={item} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        <div className="pf-resume-card__fact">
          <dt className="t-meta pf-resume-card__term">{COPY.based}</dt>
          <dd>
            {place.city} · {place.utcLabel}
            {/* Client only: the time in Bangkok once the page runs. */}
            <LocalTime
              timeZone={place.timeZone}
              className="pf-resume-card__time"
            />
          </dd>
        </div>
        <div className="pf-resume-card__fact">
          <dt className="t-meta pf-resume-card__term">{COPY.contact}</dt>
          <dd className="pf-resume-card__contact">
            <div className="pf-resume-card__email">
              <a
                href={`mailto:${siteConfig.email}`}
                className="pf-resume-card__address"
              >
                {siteConfig.email}
              </a>
              <CopyEmail />
            </div>
            <ul className="pf-resume-card__profiles">
              <li>
                <TextLink
                  href={siteConfig.socials.linkedin}
                  external
                  arrow="up-right"
                >
                  LinkedIn
                </TextLink>
              </li>
              <li>
                <TextLink
                  href={siteConfig.socials.github}
                  external
                  arrow="up-right"
                >
                  GitHub
                </TextLink>
              </li>
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
