import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
  getAdjacentVentures,
  getAllVentureSlugs,
  getVentureBySlug,
} from "@/lib/content/ventures";
import { siteConfig } from "@/lib/site";
import { PERSON_ID } from "@/lib/seo/jsonLd";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllVentureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return {};
  const title = `${venture.name} — Case study`;
  const description = venture.tagline;
  return {
    title,
    description,
    alternates: { canonical: `/ventures/${slug}` },
    openGraph: { title, description },
  };
}

function buildCaseJsonLd(slug: string): string | null {
  const venture = getVentureBySlug(slug);
  if (!venture) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteConfig.url}/ventures/${slug}`,
    name: venture.name,
    description: venture.tagline,
    url: venture.url,
    creator: { "@id": PERSON_ID },
    dateCreated: String(venture.year),
  });
}

export default async function VentureCasePage({ params }: PageProps) {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture?.caseStudy) notFound();
  const { caseStudy } = venture;
  const { prev, next } = getAdjacentVentures(slug);
  const jsonLd = buildCaseJsonLd(slug);

  return (
    <Container size="xl" className="py-14 sm:py-20 lg:py-24">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}

      <Link
        href="/ventures"
        className="text-sm text-muted transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        ← All work
      </Link>

      <PageHeader
        eyebrow={`${caseStudy.timeline} · ${venture.role}`}
        title={venture.name}
        description={caseStudy.intro}
        className="mt-8"
      />

      {venture.metrics && venture.metrics.length > 0 ? (
        <Reveal>
          <dl className="mb-14 grid grid-cols-1 gap-6 border-y border-border py-8 sm:grid-cols-3">
            {venture.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="text-sm text-muted">{metric.label}</dt>
                <dd className="mt-1 font-display text-3xl font-medium tracking-tight text-fg">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      ) : null}

      <div className="max-w-2xl space-y-12">
        {caseStudy.sections.map((section) => (
          <Reveal key={section.heading}>
            <section>
              <h2 className="font-display text-xl font-medium tracking-tight text-fg sm:text-2xl">
                {section.heading}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{section.body}</p>
            </section>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-4">
        <Button href={venture.url} target="_blank" rel="noreferrer">
          Visit {venture.urlLabel}
        </Button>
        <Button href="/contact" variant="secondary">
          Work with me
        </Button>
      </div>

      <nav
        aria-label="More work"
        className="mt-20 flex justify-between border-t border-border pt-8 text-sm"
      >
        {prev ? (
          <Link
            href={`/ventures/${prev.slug}`}
            className="text-muted transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/ventures/${next.slug}`}
            className="text-muted transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Container>
  );
}
