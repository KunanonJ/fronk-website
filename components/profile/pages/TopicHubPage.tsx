import SharePill from "@/components/bento/SharePill";
import { Badge, PixelMark } from "@/components/ds/labels";
import { Pill } from "@/components/ds/Pill";
import { Reveal } from "@/components/ds/Reveal";
import Link from "@/components/navigation/Link";
import {
  ReadingHero,
  SegmentHeadline,
} from "@/components/profile/pages/ReadingHero";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import { withoutHiddenBlogLinks } from "@/lib/content/blogVisibility";
import type { TopicPillar } from "@/lib/content/topics/pillars";
import { siteConfig } from "@/lib/site";
import { pad2 } from "@/lib/utils/pad2";

/*
 * A topic hub, in English or Thai (profile redesign, Phase 7 lane D1, plan
 * step 7a), built from the case-study parts (design spec 9): the hero (the
 * eyebrow beside the language switch, the serif h1, the lead, the FDE hubs'
 * availability and hiring buttons, Share), then one column of chapters: each
 * section with its kicker number, the operator proof as a numbered fact
 * strip, the FAQ as native disclosures (every answer stays in the HTML, so
 * the text matches the FAQPage JSON-LD), and the related links beside the
 * contact panel. From 1024 px each block sets its kicker and heading beside
 * its content, so the page uses its width. Thai hubs keep `lang="th"` on <main>; links to English pages
 * say so with `lang` and `hreflang`. Styles: `.pf-hub*` in
 * src/styles/profile/pages-hubs.css, with the case template's chapter,
 * kicker, prose and panel classes (case.css) and the FAQ of About
 * (cutover.css).
 */

/** The hub's labels in each language: the bento hub's microcopy, unchanged. */
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

/** A link on the page, with the language of its label and target if not the page's. */
type HubLink = { label: string; href: string; lang?: string };

/**
 * English and ไทย as a route switch: each link names its own language, and
 * the current one is marked. On a Thai page the switch's own name is English.
 */
function LanguageNav({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  const options = [
    { label: "English", href: `/topics/${pillar.slug}`, lang: "en" },
    { label: "ไทย", href: `/th/topics/${pillar.slug}`, lang: "th" },
  ] as const;
  return (
    <nav
      aria-label="Language"
      lang={th ? "en" : undefined}
      className="pf-work__filter"
    >
      {options.map((option) => {
        const current = (option.lang === "th") === th;
        return (
          <Link
            key={option.lang}
            href={option.href}
            hrefLang={option.lang}
            lang={option.lang}
            aria-current={current ? "page" : undefined}
            className="pf-work__option pf-hub-lang"
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

function HubHero({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  return (
    <ReadingHero
      eyebrow={COPY[pillar.locale].eyebrow}
      title={<SegmentHeadline lines={pillar.h1Lines} joiner="" />}
      lead={pillar.lede}
      aside={<LanguageNav pillar={pillar} />}
    >
      {pillar.availability ? (
        // The dot is drawn for the eye; a screen reader hears label, detail.
        <p className="pf-read-avail">
          <Badge>{pillar.availability.label}</Badge>{" "}
          <span aria-hidden="true">·</span>{" "}
          <span>{pillar.availability.detail}</span>
        </p>
      ) : null}
      <div className="pf-read-actions">
        <Pill href={pillar.ctaHref} size="hero" arrow="swap">
          {pillar.ctaLabel}
        </Pill>
        {pillar.secondaryCta ? (
          <Pill href={pillar.secondaryCta.href} variant="ghost" size="hero">
            {pillar.secondaryCta.label}
          </Pill>
        ) : null}
        <SharePill labelLang={th ? "en" : undefined} />
      </div>
    </ReadingHero>
  );
}

/** A kicker that heads a block: the pixel mark, then its label. */
function Kicker({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="t-kicker pf-case-kicker">
      <PixelMark />
      <span>{children}</span>
    </h2>
  );
}

/** A section as a chapter: its number in the kicker, the heading, the body. */
function Chapter({
  index,
  section,
}: {
  index: number;
  section: TopicPillar["sections"][number];
}) {
  return (
    <section className="pf-case-chapter pf-hub-row">
      <p className="t-kicker pf-case-kicker" aria-hidden="true">
        <PixelMark />
        <span>{pad2(index)}</span>
      </p>
      <h2 className="t-h3 pf-case-chapter__headline">{section.heading}</h2>
      <div className="t-prose pf-case-prose">
        <p>{section.body}</p>
      </div>
    </section>
  );
}

/** Operator proof: short facts in a numbered strip between hairlines. */
function Proof({ pillar }: { pillar: TopicPillar }) {
  return (
    <article
      aria-labelledby="card-proof"
      className="pf-case-chapter pf-hub-row"
    >
      <Kicker id="card-proof">{COPY[pillar.locale].proof}</Kicker>
      <ul className="pf-hub-facts">
        {pillar.proof.map((item) => (
          <li key={item} className="pf-hub-facts__item">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

/** FAQ: a native disclosure per question, the first one open. */
function Faq({ pillar }: { pillar: TopicPillar }) {
  return (
    <section
      id="topic-faq"
      aria-labelledby="card-faq"
      className="pf-case-chapter pf-hub-row"
    >
      <Kicker id="card-faq">FAQ</Kicker>
      <div className="pf-faq">
        {pillar.faqs.map((faq, index) => (
          <details
            key={faq.question}
            open={index === 0}
            className="pf-faq__item"
          >
            <summary className="pf-faq__question">
              <h3 className="pf-faq__heading">{faq.question}</h3>
              <span className="pf-faq__mark" aria-hidden="true" />
            </summary>
            <p className="t-body pf-faq__answer">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Keep exploring: the related pages as ruled rows, minus the hidden blog. */
function Explore({
  pillar,
  links,
}: {
  pillar: TopicPillar;
  links: readonly HubLink[];
}) {
  return (
    <article aria-labelledby="card-related" className="pf-hub-explore">
      <Kicker id="card-related">{COPY[pillar.locale].related}</Kicker>
      <ul className="pf-hub-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              hrefLang={link.lang}
              lang={link.lang}
              className="pf-hub-links__link"
            >
              <span>{link.label}</span>
              <span className="pf-hub-links__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Contact: the hub's pitch, its call to action and the email address. */
function Contact({ pillar }: { pillar: TopicPillar }) {
  return (
    <article aria-labelledby="card-cta" className="pf-case-hire pf-hub-contact">
      <div className="pf-case-hire__text">
        <h2 id="card-cta" className="t-meta pf-case-hire__kicker">
          {COPY[pillar.locale].contact}
        </h2>
        <p className="t-body pf-hub-contact__text">{pillar.description}</p>
      </div>
      <div className="pf-case-hire__actions">
        <Pill href={pillar.ctaHref} arrow="swap">
          {pillar.ctaLabel}
        </Pill>
        <a
          href={`mailto:${siteConfig.email}`}
          lang="en"
          className="ds-text-link pf-hub-contact__mail"
        >
          {siteConfig.email}
        </a>
      </div>
    </article>
  );
}

export default function TopicHubPage({ pillar }: { pillar: TopicPillar }) {
  const th = pillar.locale === "th";
  const related = withoutHiddenBlogLinks(pillar.relatedLinks).map(
    (link): HubLink =>
      th && link.href.startsWith("/topics/") ? { ...link, lang: "en" } : link,
  );

  return (
    <ProfileMain lang={th ? "th" : undefined} className="pf-hub">
      <HubHero pillar={pillar} />
      <div className="ds-wrap pf-hub-body">
        <div className="pf-hub-column">
          {pillar.sections.map((section, index) => (
            <Reveal key={section.heading} className="pf-case-step">
              <Chapter index={index + 1} section={section} />
            </Reveal>
          ))}
          <Reveal className="pf-case-step">
            <Proof pillar={pillar} />
          </Reveal>
          <Reveal className="pf-case-step">
            <Faq pillar={pillar} />
          </Reveal>
          <Reveal className="pf-case-step">
            <div className="pf-hub-close">
              {related.length > 0 ? (
                <Explore pillar={pillar} links={related} />
              ) : null}
              <Contact pillar={pillar} />
            </div>
          </Reveal>
        </div>
      </div>
    </ProfileMain>
  );
}
