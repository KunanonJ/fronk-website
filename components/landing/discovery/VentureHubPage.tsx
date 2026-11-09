import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import { DiscoveryAnalytics } from "@/components/landing/discovery/DiscoveryAnalytics";
import {
  HubLinkList,
  HubSection,
  hubType,
} from "@/components/landing/discovery/hubParts";
import LandingTopNav from "@/components/landing/LandingTopNav";
import type { Venture } from "@/lib/content/ventures";

type VentureHubPageProps = {
  venture: Venture;
  relatedTopics?: readonly { label: string; href: string }[];
};

/**
 * Venture case hub (restyled in visual-redesign Phase 5; copy, metrics,
 * links and JSON-LD unchanged).
 */
export default function VentureHubPage({
  venture,
  relatedTopics = [],
}: VentureHubPageProps) {
  const caseStudy = venture.caseStudy;
  const type = hubType(false);

  return (
    <>
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        navId="venture-mobile-nav"
      />
      <main id="main" className="bg-page text-ink">
        <DiscoveryAnalytics />
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 md:px-8">
          <p className={type.eyebrow}>Venture</p>
          <h1 className={type.h1}>{venture.name}</h1>
          <p className="mt-3 font-display text-h3 font-medium text-ink-2">
            {venture.tagline}
          </p>
          <p className="mt-6 text-lead text-ink-2">
            {caseStudy?.intro ?? venture.description}
          </p>

          {venture.metrics && venture.metrics.length > 0 ? (
            <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-3">
              {venture.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col bg-surface p-5 sm:p-6"
                >
                  <dt className="font-mono text-label uppercase text-ink-2">
                    {metric.label}
                  </dt>
                  <dd className="mt-2 font-display text-h2 tabular-nums text-ink">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {caseStudy ? (
            <div className="mt-14 space-y-12">
              {caseStudy.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className={`mb-3 ${type.h2}`}>{section.heading}</h2>
                  <p className="text-body text-ink-2">{section.body}</p>
                </section>
              ))}
              <p className="font-mono text-label uppercase text-ink-2">
                {caseStudy.timeline}
              </p>
            </div>
          ) : null}

          {relatedTopics.length > 0 ? (
            <HubSection title="Related topics">
              <HubLinkList links={relatedTopics} />
            </HubSection>
          ) : null}

          <div className="mt-16 flex flex-wrap items-center gap-3">
            <a
              href={venture.url}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="venture_outbound_click"
              data-venture={venture.slug}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-action px-6 text-base font-medium text-on-action transition-colors duration-150 ease-smooth hover:bg-action-hover"
            >
              {venture.urlLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/contact"
              data-analytics="contact_cta_click"
              data-venture={venture.slug}
              className="inline-flex min-h-12 items-center rounded-full border border-hairline-strong bg-surface px-6 text-base font-medium text-ink transition-colors duration-150 ease-smooth hover:border-ink/40 hover:bg-surface-tint"
            >
              Contact
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
