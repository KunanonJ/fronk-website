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
      <header className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted">Resume</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 text-muted">{profile.headline}</p>
          {profile.summary ? (
            <p className="mt-4 max-w-2xl text-muted">{profile.summary}</p>
          ) : null}
        </div>
        <div data-print-hide>
          <Button href="/resume.pdf" variant="secondary">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </header>

      <section className="space-y-12">
        {profile.sections.map((section) => (
          <TimelineSection
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-subtle/40 px-3 py-1 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

function TimelineSection({
  title,
  items,
}: {
  title: string;
  items: readonly ResolvedTimelineItem[];
}) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </h2>
      <div className="space-y-6">
        {items.map((item) => (
          <article
            key={`${item.title}-${item.org}-${item.period}`}
            className="flex gap-4"
          >
            <CompanyLogo
              name={item.logoName ?? item.org}
              domain={item.logoDomain}
              src={item.logoSrc}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium">
                  {item.href ? (
                    isExternalHref(item.href) ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link href={item.href} className="hover:text-accent">
                        {item.title}
                      </Link>
                    )
                  ) : (
                    item.title
                  )}{" "}
                  <span className="text-muted">— {item.org}</span>
                </h3>
                <span className="text-sm text-muted">{item.period}</span>
              </div>
              {item.bullets && item.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>— {bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
