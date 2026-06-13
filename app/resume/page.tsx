import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
          <Badge variant="outline">Resume</Badge>
          <h1 className="mt-4 font-display text-5xl font-bold leading-none tracking-tight sm:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-2 text-lg text-muted">{profile.headline}</p>
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

      <section className="space-y-8">
        {profile.sections.map((section) => (
          <TimelineSection
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}

        <Card className="p-6">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="normal-case tracking-normal">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
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
    <Card className="p-6">
      <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
        {title}
      </h2>
      <div className="space-y-6">
        {items.map((item) => (
          <article
            key={`${item.title}-${item.org}-${item.period}`}
            className="flex gap-4 border-b-2 border-border pb-6 last:border-b-0 last:pb-0"
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
                        className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                      >
                        {item.title}
                      </Link>
                    )
                  ) : (
                    item.title
                  )}{" "}
                  <span className="text-muted">— {item.org}</span>
                </h3>
                <span className="font-mono text-sm text-muted">{item.period}</span>
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
    </Card>
  );
}
