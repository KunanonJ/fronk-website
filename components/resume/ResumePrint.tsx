import type { ReactNode } from "react";
import { OPEN_TO_ROLES } from "@/lib/content/identity";
import type {
  ResolvedTimelineItem,
  resolveResumeProfile,
} from "@/lib/content/resumeProfile";
import { isLiveBullet, linkLabel, printGroups } from "@/lib/resume/view";
import { siteConfig } from "@/lib/site";

export type ResumeProfileView = ReturnType<typeof resolveResumeProfile>;

/**
 * The résumé as a printed document: what `pnpm pdf` renders to
 * public/resume.pdf. The /resume route shows it only in print (the bento page
 * is screen-only).
 *
 * Recruiters forward this file and applicant-tracking systems parse its text
 * layer, so the layout is deliberately plain. Keep it that way:
 *   - no opacity below 1: Chromium then draws the element as a transparency
 *     group, and its text comes out of the PDF in fragments and out of order;
 *   - no letter-spacing: extractors split or join words on it;
 *   - a static system font, not the site's variable Geist: Chromium writes
 *     Geist's medium and semibold text so that extractors split words after
 *     an "m" ("Sum m ary"); kerning and ligature settings do not change it;
 *   - nothing decorative as text (logo initials, running numbers): it would
 *     join the job titles in the text layer, whatever `aria-hidden` says;
 *   - contact details as real links, in the header.
 * ResumePrint.test.tsx guards these. Change the layout deliberately, then
 * regenerate the PDF and read its text layer back.
 */

/** Static fonts every desktop has; the PDF embeds the one it prints with. */
export const PRINT_FONT = "Arial, Helvetica, sans-serif";

export function ResumePrint({ profile }: { profile: ResumeProfileView }) {
  const groups = printGroups(profile.sections);
  const contacts = [
    { label: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { label: linkLabel(siteConfig.url), href: siteConfig.url },
    {
      label: linkLabel(siteConfig.socials.linkedin),
      href: siteConfig.socials.linkedin,
    },
    {
      label: linkLabel(siteConfig.socials.github),
      href: siteConfig.socials.github,
    },
  ];

  return (
    <div
      data-resume-print
      style={{ fontFamily: PRINT_FONT }}
      className="text-[13px] leading-[1.35] text-ink"
    >
      <header>
        <h1 className="m-0 text-[28px] leading-[1.15] font-bold">
          {profile.name}
        </h1>
        <p className="mt-1 mb-0 text-[15px] font-medium">{profile.headline}</p>
        <p data-resume-contact className="mt-2 mb-0 text-ink-2">
          Bangkok, Thailand
          {contacts.map((contact) => (
            <span key={contact.href}>
              {" | "}
              <a href={contact.href}>{contact.label}</a>
            </span>
          ))}
        </p>
        {profile.languages.length > 0 ? (
          <p className="m-0 text-ink-2">{profile.languages.join(" | ")}</p>
        ) : null}
        <p className="mt-1 mb-0 font-medium">{OPEN_TO_ROLES.sentence}</p>
      </header>

      <PrintSection title="Summary">
        <p className="m-0">{profile.summary}</p>
      </PrintSection>

      {groups
        .filter((group) => group.kind === "entries")
        .map((group) => (
          <PrintSection key={group.title} title={group.title}>
            {group.items.map((item) => (
              <PrintEntry key={itemKey(item)} item={item} />
            ))}
          </PrintSection>
        ))}

      <PrintSection title="Core skills">
        {profile.skills.map((group) => (
          <p key={group.label} className="m-0">
            {/* The space sits inside the label, so the PDF keeps it. */}
            <strong className="font-semibold">{`${group.label}: `}</strong>
            {group.items.join(", ")}.
          </p>
        ))}
      </PrintSection>

      {groups
        .filter((group) => group.kind === "lines")
        .map((group) => (
          <PrintSection key={group.title} title={group.title}>
            {group.items.map((item) => (
              <p key={itemKey(item)} className="m-0">
                <strong className="font-semibold">{item.org}</strong>
                {" | "}
                {item.title}
                {" | "}
                {printPeriod(item.period)}
              </p>
            ))}
          </PrintSection>
        ))}
    </div>
  );
}

/** "Sep 2025 — Present" -> "Sep 2025 - Present": the plain hyphen every parser reads. */
function printPeriod(period: string): string {
  return period.replace(/\s[—–]\s/, " - ");
}

function itemKey(item: ResolvedTimelineItem): string {
  return `${item.title}-${item.org}-${item.period}`;
}

function PrintSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-3">
      <h2 className="m-0 mb-1.5 break-after-avoid border-b border-hairline-strong pb-1 text-[14px] leading-[1.3] font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A role or a project: title and period, organisation, note, bullets. */
function PrintEntry({ item }: { item: ResolvedTimelineItem }) {
  // "Live at gogocash.co." repeats the link the organisation line prints.
  const bullets = (item.bullets ?? []).filter(
    (bullet) => !(item.href && isLiveBullet(bullet)),
  );
  return (
    // An <article>, so the print stylesheet keeps the entry on one page.
    <article className="mt-2 first:mt-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="m-0 font-semibold">{item.title}</h3>
        <span className="shrink-0 text-ink-2">{printPeriod(item.period)}</span>
      </div>
      <p className="m-0 text-ink-2">
        {item.org}
        {item.href ? (
          <>
            {" | "}
            <a href={item.href}>{linkLabel(item.href)}</a>
          </>
        ) : null}
      </p>
      {item.note ? <p className="m-0 text-ink-2">{item.note}</p> : null}
      {bullets.length > 0 ? (
        <ul className="mt-1 mb-0 list-disc pl-[18px]">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
