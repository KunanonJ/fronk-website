import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DiscoveryAnalytics } from "@/components/landing/discovery/DiscoveryAnalytics";
import {
  HubLinkList,
  HubSection,
  hubType,
} from "@/components/landing/discovery/hubParts";
import LandingTopNav from "@/components/landing/LandingTopNav";
import type { TopicPillar } from "@/lib/content/topics/pillars";
import { withoutHiddenBlogLinks } from "@/lib/content/blogVisibility";
import { cn } from "@/lib/utils/cn";

type TopicHubPageProps = {
  pillar: TopicPillar;
};

/**
 * Category pillar layout for sea-discovery topic hubs (restyled in
 * visual-redesign Phase 5; copy, FAQ text, links and JSON-LD unchanged).
 * One job: answer the intent with proof, FAQ, and internal links.
 */
export default function TopicHubPage({ pillar }: TopicHubPageProps) {
  const th = pillar.locale === "th";
  const type = hubType(th);
  const related = withoutHiddenBlogLinks(pillar.relatedLinks);

  // Root <html lang> is "en"; mark Thai pillar content as Thai.
  return (
    <>
      <LandingTopNav position="fixed" wordmarkHref="/" navId="topic-mobile-nav" />
      <main id="main" lang={th ? "th" : undefined} className="bg-page text-ink">
        <DiscoveryAnalytics />
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 md:px-8">
          <p className={type.eyebrow}>{th ? "หัวข้อ" : "Topic"}</p>
          <h1 className={type.h1}>{pillar.h1}</h1>
          <p className={cn("mt-5 text-ink-2", type.lead)}>{pillar.lede}</p>

          <div className="mt-14 space-y-12">
            {pillar.sections.map((section) => (
              <section key={section.heading}>
                <h2 className={cn("mb-3", type.h2)}>{section.heading}</h2>
                <p className="text-body text-ink-2">{section.body}</p>
              </section>
            ))}
          </div>

          <HubSection title={th ? "หลักฐานจากงานจริง" : "Operator proof"} th={th}>
            <ul className="space-y-3 text-body text-ink-2">
              {pillar.proof.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-[0.65em] size-1.5 shrink-0 bg-signal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </HubSection>

          <HubSection title="FAQ" id="topic-faq" th={th}>
            <dl className="divide-y divide-hairline border-y border-hairline">
              {pillar.faqs.map((faq) => (
                <div key={faq.question} className="py-5">
                  <dt className="text-body font-medium text-ink">{faq.question}</dt>
                  <dd className="mt-2 text-body text-ink-2">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </HubSection>

          {related.length > 0 ? (
            <HubSection title={th ? "อ่านต่อ" : "Keep exploring"} th={th}>
              <HubLinkList links={related} />
            </HubSection>
          ) : null}

          <div className="mt-16">
            <Link
              href={pillar.ctaHref}
              data-analytics="topic_hub_cta"
              data-topic-slug={pillar.slug}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-action px-6 text-base font-medium text-on-action transition-colors duration-150 ease-smooth hover:bg-action-hover"
            >
              {pillar.ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
