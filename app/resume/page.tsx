import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/CompanyLogo";
import {
  resolveResumeProfile,
  type ResolvedTimelineItem,
  type ResolvedTimelineSection,
} from "@/lib/content/resumeProfile";
import { fetchResumeProfile } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Kunanon Jarat (Fronk) — Founder, IT manager, and project leader across fintech, AI, and Web3.",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export default async function ResumePage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await fetchResumeProfile({ preview });
  const profile = resolveResumeProfile(cms);

  return (
    <Container size="lg" className="py-20">
      <header className="mb-16 flex flex-col items-start justify-between gap-8 border-b border-border pb-12 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="label-mono text-subtle">§ Résumé / Kunanon Jarat</span>
          <h1 className="mt-5 font-display text-display font-light leading-[0.95] tracking-tight">
            {profile.name}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-4 font-display text-lg font-semibold text-fg sm:text-xl">
            {profile.headline}
          </p>
          {profile.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {profile.summary}
            </p>
          ) : null}
        </div>
        <div data-print-hide className="shrink-0">
          <Button href="/resume.pdf" variant="secondary">
            <Download className="h-4 w-4" />
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

        <SkillsSection skills={profile.skills} />
      </div>
    </Container>
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
  return 1 - t * 0.45;
}

function TimelineSection({
  section,
  sectionIndex,
}: {
  section: ResolvedTimelineSection;
  sectionIndex: number;
}) {
  return (
    <section aria-label={section.title}>
      <div className="mb-6 flex items-baseline gap-3 rule-hud pt-6">
        <span className="label-mono text-subtle tabular-nums">
          {formatIndex(sectionIndex)}
        </span>
        <h2 className="label-mono text-fg">{section.title}</h2>
      </div>

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
      className="flex gap-4 border-t border-border py-6 first:border-t-0 first:pt-0"
    >
      <CompanyLogo
        name={item.logoName ?? item.org}
        domain={item.logoDomain}
        src={item.logoSrc}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-base font-semibold tracking-tight">
            <EntryTitle item={item} />{" "}
            <span className="font-normal text-muted">— {item.org}</span>
          </h3>
          <span className="label-mono shrink-0 text-subtle tabular-nums">
            {item.period}
          </span>
        </div>

        {item.bullets && item.bullets.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span aria-hidden="true" className="text-subtle">
                  —
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Faint right-aligned running index — the §E technical-résumé motif. */}
      <span
        aria-hidden="true"
        className="font-mono text-xs tabular-nums text-subtle"
      >
        {formatIndex(index)}
      </span>
    </article>
  );
}

function EntryTitle({ item }: { item: ResolvedTimelineItem }) {
  if (!item.href) return <>{item.title}</>;

  const className =
    "text-fg underline decoration-accent underline-offset-4 hover:text-accent";

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

function SkillsSection({ skills }: { skills: readonly string[] }) {
  return (
    <section aria-label="Skills">
      <div className="mb-6 flex items-baseline gap-3 rule-hud pt-6">
        <span className="label-mono text-subtle tabular-nums">★</span>
        <h2 className="label-mono text-fg">Skills</h2>
      </div>

      <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill, i) => (
          <li
            key={skill}
            className="flex items-baseline gap-3 border-t border-border pt-3 text-sm text-fg"
          >
            <span className="label-mono text-subtle tabular-nums">
              {formatIndex(i)}
            </span>
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
