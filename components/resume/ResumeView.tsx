import Link from "@/components/navigation/Link";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/CompanyLogo";
import type {
  ResolvedTimelineItem,
  ResolvedTimelineSection,
  resolveResumeProfile,
} from "@/lib/content/resumeProfile";

export type ResumeProfileView = ReturnType<typeof resolveResumeProfile>;

/**
 * The resume page body. Shared by the Next page (app/(system)/resume) and the
 * TanStack Start route, which each load the profile their own way.
 */
export function ResumeView({ profile }: { profile: ResumeProfileView }) {
  return (
    <main id="main">
      <Container size="lg" className="py-14 sm:py-20 lg:py-24">
        <header className="mb-14 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-label uppercase text-ink-2">Résumé</p>
            <h1 className="mt-4 font-display text-h1 text-ink">
              {profile.name}
              <span className="text-link">.</span>
            </h1>
            <p className="mt-4 text-lead font-medium text-ink">
              {profile.headline}
            </p>
            {profile.summary ? (
              <p className="mt-4 text-body text-ink-2">{profile.summary}</p>
            ) : null}
          </div>
          <div data-print-hide className="shrink-0">
            <Button href="/resume.pdf" variant="secondary">
              <Download className="h-4 w-4" aria-hidden />
              Download PDF
            </Button>
          </div>
        </header>

        <div className="space-y-16">
          {profile.sections.map((section, sectionIndex) => (
            <TimelineSection
              key={section.title}
              section={section}
              sectionIndex={sectionIndex}
            />
          ))}

          <SkillsSection
            skills={profile.skills}
            sectionIndex={profile.sections.length}
          />
        </div>
      </Container>
    </main>
  );
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** Right-aligned monospace running index, e.g. 01, 02, 03 … */
function formatIndex(n: number): string {
  return String(n + 1).padStart(2, "0");
}

/**
 * Faintness for the "fade-out tail": entries stay full-strength near the top of
 * a section and dim toward the oldest, so depth reads as recency. Clamped so the
 * tail never drops below readable contrast (and so print stays legible).
 */
function tailOpacity(position: number, total: number): number {
  if (total <= 1) return 1;
  const t = position / (total - 1);
  // Floor at 0.9: any deeper fade pushes ink-2 text below WCAG AA 4.5:1 on
  // the page colour (4.9:1 at 0.9; enforced by tests/e2e/a11y.spec.ts).
  return 1 - t * 0.1;
}

function SectionHeader({
  id,
  index,
  title,
}: {
  id: string;
  index: number;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-baseline gap-3 border-t border-hairline pt-6">
      <span aria-hidden="true" className="font-mono text-label tabular-nums text-ink-2">
        {formatIndex(index)}
      </span>
      <h2 id={id} className="font-display text-h3 text-ink">
        {title}
      </h2>
    </div>
  );
}

function TimelineSection({
  section,
  sectionIndex,
}: {
  section: ResolvedTimelineSection;
  sectionIndex: number;
}) {
  const headingId = `resume-section-${sectionIndex}`;
  return (
    <section aria-labelledby={headingId}>
      <SectionHeader id={headingId} index={sectionIndex} title={section.title} />

      <div>
        {section.items.map((item, itemIndex) => (
          <TimelineEntry
            key={`${item.title}-${item.org}-${item.period}`}
            item={item}
            index={itemIndex}
            opacity={tailOpacity(itemIndex, section.items.length)}
          />
        ))}
      </div>
    </section>
  );
}

function TimelineEntry({
  item,
  index,
  opacity,
}: {
  item: ResolvedTimelineItem;
  index: number;
  opacity: number;
}) {
  return (
    <article
      style={{ opacity }}
      className="flex gap-4 border-t border-hairline py-6 first:border-t-0 first:pt-0"
    >
      <CompanyLogo
        name={item.logoName ?? item.org}
        domain={item.logoDomain}
        src={item.logoSrc}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="min-w-0 break-words text-body font-medium text-ink">
            <EntryTitle item={item} />
            <span className="mt-0.5 block text-small font-normal text-ink-2">
              {item.org}
            </span>
          </h3>
          <span className="shrink-0 font-mono text-label tabular-nums text-ink-2">
            {item.period}
          </span>
        </div>

        {item.bullets && item.bullets.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-small text-ink-2">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 bg-ink-2" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Faint right-aligned running index. */}
      <span
        aria-hidden="true"
        className="font-mono text-label tabular-nums text-ink-2"
      >
        {formatIndex(index)}
      </span>
    </article>
  );
}

function EntryTitle({ item }: { item: ResolvedTimelineItem }) {
  if (!item.href) return <>{item.title}</>;

  const className =
    "text-ink underline decoration-link/50 underline-offset-4 transition-colors hover:text-link hover:decoration-link";

  if (isExternalHref(item.href)) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {item.title}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.title}
    </Link>
  );
}

function SkillsSection({
  skills,
  sectionIndex,
}: {
  skills: readonly string[];
  sectionIndex: number;
}) {
  return (
    <section aria-labelledby="resume-skills">
      <SectionHeader id="resume-skills" index={sectionIndex} title="Skills" />

      <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill, i) => (
          <li
            key={skill}
            className="flex items-baseline gap-3 border-t border-hairline pt-3 text-small text-ink"
          >
            <span aria-hidden="true" className="font-mono text-label tabular-nums text-ink-2">
              {formatIndex(i)}
            </span>
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
