import Link from "next/link";
import { DiscoveryAnalytics } from "@/components/landing/discovery/DiscoveryAnalytics";
import type { Venture } from "@/lib/content/ventures";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

type VentureHubPageProps = {
  venture: Venture;
  relatedTopics?: readonly { label: string; href: string }[];
};

export default function VentureHubPage({
  venture,
  relatedTopics = [],
}: VentureHubPageProps) {
  const caseStudy = venture.caseStudy;

  return (
    <main id="main" className="bg-landing text-primary">
      <DiscoveryAnalytics />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/55">
          Venture
        </p>
        <h1
          className="text-4xl font-medium tracking-tight text-primary sm:text-5xl"
          style={serif}
        >
          {venture.name}
        </h1>
        <p className="mt-3 text-xl text-primary/70" style={serif}>
          {venture.tagline}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-primary/75">
          {caseStudy?.intro ?? venture.description}
        </p>

        {venture.metrics && venture.metrics.length > 0 ? (
          <ul className="mt-10 grid grid-cols-3 gap-4 border-y border-primary/15 py-6">
            {venture.metrics.map((metric) => (
              <li key={metric.label}>
                <p className="text-2xl text-primary" style={serif}>
                  {metric.value}
                </p>
                <p className="text-xs uppercase tracking-[0.15em] text-primary/55">
                  {metric.label}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {caseStudy ? (
          <div className="mt-12 space-y-10">
            {caseStudy.sections.map((section) => (
              <section key={section.heading}>
                <h2
                  className="mb-3 text-2xl font-medium text-primary"
                  style={serif}
                >
                  {section.heading}
                </h2>
                <p className="text-base leading-relaxed text-primary/75">
                  {section.body}
                </p>
              </section>
            ))}
            <p className="text-sm text-primary/55">{caseStudy.timeline}</p>
          </div>
        ) : null}

        {relatedTopics.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-4 text-2xl font-medium text-primary" style={serif}>
              Related topics
            </h2>
            <ul className="space-y-2">
              {relatedTopics.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-16 flex flex-wrap gap-4">
          <a
            href={venture.url}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="venture_outbound_click"
            data-venture={venture.slug}
            className="inline-flex border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.15em] text-primary transition-colors hover:bg-cream hover:text-black"
          >
            {venture.urlLabel}
          </a>
          <Link
            href="/contact"
            data-analytics="contact_cta_click"
            data-venture={venture.slug}
            className="inline-flex px-6 py-3 text-sm uppercase tracking-[0.15em] text-primary/70 underline decoration-primary/30 underline-offset-4 hover:text-primary hover:decoration-primary"
          >
            Contact
          </Link>
        </div>
      </article>
    </main>
  );
}
