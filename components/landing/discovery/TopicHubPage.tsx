import Link from "next/link";
import { DiscoveryAnalytics } from "@/components/landing/discovery/DiscoveryAnalytics";
import type { TopicPillar } from "@/lib/content/topics/pillars";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

type TopicHubPageProps = {
  pillar: TopicPillar;
};

/**
 * Category pillar layout for sea-discovery topic hubs.
 * One job: answer the intent with proof, FAQ, and internal links.
 */
export default function TopicHubPage({ pillar }: TopicHubPageProps) {
  return (
    <main id="main" className="bg-black text-primary">
      <DiscoveryAnalytics />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/55">
          {pillar.locale === "th" ? "หัวข้อ" : "Topic"}
        </p>
        <h1
          className="text-4xl font-medium tracking-tight text-primary sm:text-5xl"
          style={serif}
        >
          {pillar.h1}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-primary/75">
          {pillar.lede}
        </p>

        <div className="mt-12 space-y-10">
          {pillar.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-2xl font-medium text-primary" style={serif}>
                {section.heading}
              </h2>
              <p className="text-base leading-relaxed text-primary/75">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-medium text-primary" style={serif}>
            {pillar.locale === "th" ? "หลักฐานจากงานจริง" : "Operator proof"}
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-primary/75">
            {pillar.proof.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="topic-faq">
          <h2
            id="topic-faq"
            className="mb-6 text-2xl font-medium text-primary"
            style={serif}
          >
            FAQ
          </h2>
          <dl className="space-y-6">
            {pillar.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-primary">{faq.question}</dt>
                <dd className="mt-2 text-primary/75">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-medium text-primary" style={serif}>
            {pillar.locale === "th" ? "อ่านต่อ" : "Keep exploring"}
          </h2>
          <ul className="space-y-2">
            {pillar.relatedLinks.map((link) => (
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

        <div className="mt-16">
          <Link
            href={pillar.ctaHref}
            data-analytics="topic_hub_cta"
            data-topic-slug={pillar.slug}
            className="inline-flex border border-primary/40 px-6 py-3 text-sm uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-black"
          >
            {pillar.ctaLabel}
          </Link>
        </div>
      </article>
    </main>
  );
}
