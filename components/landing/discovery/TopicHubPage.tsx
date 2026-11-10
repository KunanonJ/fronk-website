import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import {
  Bento,
  BentoCard,
  BentoPair,
  PageMain,
  bentoSpan,
  type BentoSpans,
} from "@/components/bento/Bento";
import { ctaClasses } from "@/components/bento/Buttons";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import { DiscoveryAnalytics } from "@/components/landing/discovery/DiscoveryAnalytics";
import { topicGrid } from "@/components/landing/discovery/hubLayout";
import LinkRows, {
  type HubLink,
} from "@/components/landing/discovery/LinkRows";
import { withoutHiddenBlogLinks } from "@/lib/content/blogVisibility";
import type { TopicPillar } from "@/lib/content/topics/pillars";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/** Card labels (canvas microcopy) in each language. */
const COPY = {
  en: {
    eyebrow: "Topic",
    proof: "Operator proof",
    related: "Keep exploring",
    contact: "Contact",
  },
  th: {
    eyebrow: "หัวข้อ",
    proof: "หลักฐานจากงานจริง",
    related: "อ่านต่อ",
    contact: "ติดต่อ",
  },
} as const;

/**
 * Thai needs room above and below the line and no negative tracking (spec
 * 1.6): display text at 1.3, body at 1.75.
 */
function bodyLeading(th: boolean): string {
  return th ? "leading-[1.75]" : "leading-[1.6]";
}

/** A card kicker's text; Thai opens the pill's line to 1.4 for its marks. */
function kicker(text: string, th: boolean): ReactNode {
  return th ? <span className="leading-[1.4]">{text}</span> : text;
}

/** English / ไทย as a route switch: each link names its own language. */
function LanguageNav({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  const options = [
    { label: "English", href: `/topics/${pillar.slug}`, lang: "en" },
    { label: "ไทย", href: `/th/topics/${pillar.slug}`, lang: "th" },
  ] as const;
  return (
    <nav
      aria-label="Language"
      className="inline-flex gap-1 rounded-full border border-hairline bg-surface p-1 shadow-card"
    >
      {options.map((option) => {
        const current = (option.lang === "th") === th;
        return (
          <Link
            key={option.lang}
            href={option.href}
            hrefLang={option.lang}
            lang={current ? undefined : option.lang}
            aria-current={current ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full px-[18px] text-sm font-medium no-underline",
              current ? "bg-cta text-on-cta" : "text-ink-2",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The hero: eyebrow and language switch, the h1 drawn line by line (muted
 * connector words, accent last line), the lede, the CTA and Share. The h1 is
 * the LCP element; its lines only slide (`kj-lines`).
 */
function TopicHero({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  const last = pillar.h1Lines.length - 1;
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className={cn(
            "m-0 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-[7px] text-ink-2",
            // Geist Mono has no Thai glyphs: the Thai eyebrow stays in the sans.
            th
              ? "text-meta leading-[1.4] font-medium"
              : "font-mono text-xs leading-none tracking-[0.06em] uppercase",
          )}
        >
          <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
          {COPY[pillar.locale].eyebrow}
        </p>
        <LanguageNav pillar={pillar} />
      </div>
      <h1
        id="hero-title"
        className={cn(
          "kj-lines m-0 text-ink",
          th
            ? "text-[clamp(2rem,5vw,3.5rem)] leading-[1.3] font-semibold tracking-normal [overflow-wrap:anywhere]"
            : "text-title",
        )}
      >
        {pillar.h1Lines.map((line, i) => (
          <span key={i} className={cn("block", i === last && "text-mark")}>
            {line.map((segment, j) =>
              typeof segment === "string" ? (
                segment
              ) : (
                <span key={j} className="text-ink-3">
                  {segment.muted}
                </span>
              ),
            )}
          </span>
        ))}
      </h1>
      <p
        className={cn(
          "m-0 max-w-[620px] text-lg text-ink-2",
          th ? "leading-[1.75]" : "leading-[1.55]",
        )}
      >
        {pillar.lede}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={pillar.ctaHref}
          data-analytics="topic_hub_cta"
          data-topic-slug={pillar.slug}
          className={ctaClasses()}
        >
          {pillar.ctaLabel}
          <ArrowUpRightIcon strokeWidth={2} className="shrink-0" />
        </Link>
        <SharePill labelLang={th ? "en" : undefined} />
      </div>
    </section>
  );
}

/** A section as a card: its heading as the kicker, a big index, the body. */
function SectionCard({
  index,
  section,
  span,
  th,
}: {
  index: number;
  section: { heading: string; body: string };
  span: BentoSpans;
  th: boolean;
}) {
  const lead = span.lg > 1;
  return (
    <BentoCard
      headingId={`card-s${index}`}
      title={kicker(section.heading, th)}
      minHeight={false}
      className={cn(bentoSpan(span), th ? "min-h-[260px]" : "min-h-[280px]")}
    >
      <p
        aria-hidden
        className="m-0 mt-auto px-1 font-mono text-[40px] leading-none font-medium tracking-[-0.03em] text-mark"
      >
        {pad2(index)}
      </p>
      <p
        className={cn(
          "m-0 px-1 text-ink-2",
          lead ? "max-w-[580px] text-base" : "text-card",
          bodyLeading(th),
        )}
      >
        {section.body}
      </p>
    </BentoCard>
  );
}

/** Operator proof: accent-marked lines under hairlines. */
function ProofCard({
  pillar,
  span,
}: {
  pillar: TopicPillar;
  span: BentoSpans;
}) {
  const th = pillar.locale === "th";
  return (
    <BentoCard
      headingId="card-proof"
      title={kicker(COPY[pillar.locale].proof, th)}
      gap={3}
      minHeight={false}
      className={cn(bentoSpan(span), th ? "min-h-[300px]" : "min-h-[280px]")}
    >
      <ul className="m-0 mt-auto flex list-none flex-col px-1">
        {pillar.proof.map((item, i) => {
          const lastItem = i === pillar.proof.length - 1;
          return (
            <li
              key={item}
              className={cn(
                "flex items-baseline gap-3.5",
                lastItem ? "pt-3.5 pb-1" : "border-b border-hairline py-3.5",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-[7px] shrink-0 bg-mark",
                  th ? "-translate-y-[3px]" : "-translate-y-0.5",
                )}
              />
              <span
                className={cn(
                  "min-w-0 font-medium",
                  th ? "text-base leading-[1.6]" : "text-[17px] leading-[1.45]",
                )}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </BentoCard>
  );
}

/**
 * FAQ as a static list (spec 3.11: topic FAQs are not disclosures; the
 * FAQPage JSON-LD carries the same pairs). Full width sets question and
 * answer side by side; narrower, the answer sits under its question.
 */
function FaqCard({ pillar, span }: { pillar: TopicPillar; span: BentoSpans }) {
  const th = pillar.locale === "th";
  const wide = span.lg === 3;
  return (
    <BentoCard
      id="topic-faq"
      headingId="card-faq"
      title="FAQ"
      gap={3}
      minHeight={false}
      className={cn(bentoSpan(span), "pb-3", !wide && "min-h-[300px]")}
    >
      <dl className={cn("m-0 flex flex-col px-1", !wide && "mt-auto")}>
        {pillar.faqs.map((faq, i) => (
          <div
            key={faq.question}
            className={cn(
              "flex gap-2",
              wide ? "flex-wrap gap-x-8 py-5" : "flex-col py-[18px]",
              i < pillar.faqs.length - 1 && "border-b border-hairline",
            )}
          >
            <dt
              className={cn(
                "flex min-w-0 gap-3 text-base font-medium text-ink",
                wide && "flex-[1_1_260px]",
                th ? "leading-[1.6]" : "leading-normal",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "shrink-0 font-mono text-xs text-ink-2",
                  th ? "pt-[5px]" : "pt-1",
                )}
              >
                {pad2(i + 1)}
              </span>
              <span className="min-w-0">{faq.question}</span>
            </dt>
            <dd
              className={cn(
                "m-0 min-w-0 text-card text-ink-2",
                wide ? "flex-[2_1_360px]" : "ml-7",
                bodyLeading(th),
              )}
            >
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </BentoCard>
  );
}

/** Keep exploring: the related pages, minus the hidden blog. */
function ExploreCard({
  pillar,
  links,
}: {
  pillar: TopicPillar;
  links: readonly HubLink[];
}) {
  return (
    <BentoCard
      headingId="card-related"
      title={kicker(COPY[pillar.locale].related, pillar.locale === "th")}
      gap={3}
      minHeight={false}
      className="min-h-[300px]"
    >
      <LinkRows links={links} className="mt-auto" />
    </BentoCard>
  );
}

/** Contact: the pillar's pitch, its CTA and the email address. */
function ContactCard({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  return (
    <BentoCard
      headingId="card-cta"
      title={kicker(COPY[pillar.locale].contact, th)}
      minHeight={false}
      className="min-h-[300px]"
    >
      <p
        className={cn("m-0 mt-auto px-1 text-card text-ink-2", bodyLeading(th))}
      >
        {pillar.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1">
        <Link
          href={pillar.ctaHref}
          data-analytics="topic_hub_cta"
          data-topic-slug={pillar.slug}
          className={ctaClasses("primary", "md")}
        >
          {pillar.ctaLabel}
          <ArrowUpRightIcon strokeWidth={2} className="shrink-0" />
        </Link>
        <a
          href={`mailto:${siteConfig.email}`}
          className="inline-flex min-h-11 min-w-0 items-center text-sm font-medium [overflow-wrap:anywhere]"
        >
          {siteConfig.email}
        </a>
      </div>
    </BentoCard>
  );
}

/**
 * Topic pillar hub (bento redesign, phase 7c; design spec 4.15 and 4.16), in
 * English or Thai. The cards follow the canvas grid for any number of
 * sections (`topicGrid`); the related links and the contact card share the
 * last row. Thai pages keep `lang="th"` on <main>, and links back to English
 * say so with `lang` and `hreflang`.
 */
export default function TopicHubPage({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  const grid = topicGrid(pillar.sections.length);
  const related = withoutHiddenBlogLinks(pillar.relatedLinks).map(
    (link): HubLink =>
      th && link.href.startsWith("/topics/") ? { ...link, lang: "en" } : link,
  );

  return (
    <PageMain lang={th ? "th" : undefined}>
      <DiscoveryAnalytics />
      <TopicHero pillar={pillar} />
      <Bento>
        {pillar.sections.map((section, i) => (
          <SectionCard
            key={section.heading}
            index={i + 1}
            section={section}
            span={grid.sections[i]}
            th={th}
          />
        ))}
        <ProofCard pillar={pillar} span={grid.proof} />
        <FaqCard pillar={pillar} span={grid.faq} />
        {/* bento-row: the pair holds still on hover; its cards lift. */}
        <BentoPair className={cn("bento-row", bentoSpan(3))}>
          {related.length > 0 ? (
            <ExploreCard pillar={pillar} links={related} />
          ) : null}
          <ContactCard pillar={pillar} />
        </BentoPair>
      </Bento>
    </PageMain>
  );
}
