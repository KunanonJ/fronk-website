import { Fragment } from "react";
import { Badge, Chip } from "@/components/ds/labels";
import { Pill, pillClass } from "@/components/ds/Pill";
import { TextLink } from "@/components/ds/TextLink";
import ContributionActivity from "@/components/landing/ContributionActivity";
import Link from "@/components/navigation/Link";
import AboutBento from "@/components/profile/home/AboutBento";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { Story } from "@/components/profile/home/Story";
import { FaqList } from "@/components/profile/pages/FaqList";
import { PageHero } from "@/components/profile/pages/PageHero";
import { PortraitPlay } from "@/components/profile/pages/PortraitPlay";
import {
  RecruiterLines,
  RecruiterLinks,
} from "@/components/profile/pages/RecruiterFacts";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/ui/SocialIcons";
import {
  aboutPage,
  type AboutInline,
  type AboutParagraph,
} from "@/lib/content/aboutPage";
import { AVAILABILITY } from "@/lib/content/availability";
import { aboutRecruiterLinks, contactPage } from "@/lib/content/contact";
import { aboutHeadline, aboutPageCopy } from "@/lib/content/corePages";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { keepNamesWhole } from "@/lib/content/keepWhole";
import { socials } from "@/lib/content/landing";
import { operatingModel } from "@/lib/content/operatingModel";
import { pad2 } from "@/lib/utils/pad2";

/*
 * /about (profile redesign, Phase 6 cutover; plan step 6d), built from the
 * redesign's parts: the hero beside the portrait, the About bento (Phase 3),
 * the story and the career records (Phase 4, "#story"), then today's Now,
 * tech stack and operating model in the new tiles, the GitHub year, the FAQ
 * as disclosures and the "Next" card with the recruiter links. The h1
 * restates the page title, word for word. Every answer of the FAQPage
 * JSON-LD stays in the HTML. The ids that other pages link (#principles,
 * #now, #faq, #how-i-ship) and #stack stay.
 *
 * Outside the FAQ and the footer, each thing is said once (UX sweep
 * 21-11-26): the parts borrowed from Home and Contact give way to this
 * page's own. The bento leaves its principle tiles to "How I ship", whose
 * stage list is "#principles"; the story leaves its now block to the Now
 * section; the Next card leaves the availability line to Now and keeps the
 * time zone. Styles: `.pf-about-page*` in src/styles/profile/cutover.css.
 */

const SOCIAL_ICONS = {
  X: XIcon,
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
} as const satisfies Record<(typeof socials)[number]["label"], unknown>;

/** A run of the story, its names unbroken on phones (keepWhole.ts). */
function InlineSpan({ span }: { span: AboutInline }) {
  const text = keepNamesWhole(span.text);
  if (span.type === "text") return text;
  if (span.external) {
    return (
      <a
        href={span.href}
        target="_blank"
        rel="noopener"
        className="ds-prose-link"
      >
        {text}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={span.href} className="ds-prose-link">
      {text}
    </Link>
  );
}

function RichParagraphs({
  paragraphs,
}: {
  paragraphs: readonly AboutParagraph[];
}) {
  return paragraphs.map((paragraph, index) => (
    <p key={index}>
      {paragraph.spans.map((span, at) => (
        <InlineSpan key={at} span={span} />
      ))}
    </p>
  ));
}

/**
 * The portrait, loaded first as a likely LCP, with the social links on it,
 * and the pixel portrait over it (PortraitPlay).
 */
function Portrait() {
  const { hero } = aboutPage;
  return (
    <div id="portrait" className="pf-about-page__portrait">
      <img
        src={hero.portraitSrc}
        alt={hero.portraitAlt}
        width={480}
        height={480}
        fetchPriority="high"
        decoding="async"
        className="pf-about-page__photo"
      />
      <PortraitPlay />
      <ul aria-label={aboutPageCopy.socials} className="pf-about-page__socials">
        {socials.map(({ label, href }) => {
          const Icon = SOCIAL_ICONS[label];
          return (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className={`${pillClass({ variant: "ghost", round: true })} pf-about-page__social`}
              >
                <Icon size={18} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AboutHero() {
  const { hero } = aboutPage;
  return (
    <PageHero
      eyebrow={`${hero.nickname} · ${hero.location}`}
      lines={aboutHeadline}
      lead={hero.role}
      aside={<Portrait />}
    >
      <p className="pf-about-page__availability">
        <Badge>{AVAILABILITY.pill.label}</Badge>
        {/* The badge and the detail are one line to a screen reader. */}
        <span className="sr-only">, </span>
        <span className="t-small pf-about-page__detail">
          {AVAILABILITY.pill.detail}
        </span>
      </p>
      <div className="pf-about-page__actions">
        <Pill href={hero.primaryCta.href} size="hero" arrow="swap">
          {hero.primaryCta.label}
        </Pill>
        <Pill href={hero.secondaryCta.href} variant="ghost" size="hero">
          {hero.secondaryCta.label}
        </Pill>
        <a href={hero.storyHref} className="ds-text-link pf-about-page__jump">
          <span>{hero.storyLabel}</span>
          <span className="ds-text-link__arrow" aria-hidden="true">
            ↓
          </span>
        </a>
      </div>
    </PageHero>
  );
}

/**
 * The story's header over Phase 4's story and records card. The section is
 * "#story", heading included: the hero's "Read my story" lands on the header,
 * below the bar, not on the paragraphs under it.
 */
function StorySection() {
  const { hero, story } = aboutPage;
  return (
    <section
      id={hero.storyHref.slice(1)}
      aria-labelledby="story-title"
      className="pf-about-page__story"
    >
      <div className="ds-wrap">
        <SectionHeader
          eyebrow={story.eyebrow}
          title={story.heading}
          titleId="story-title"
          titleMaxWidth={16}
        />
      </div>
      <Story anchor={false} now={false} />
    </section>
  );
}

function NowSection() {
  const { now } = aboutPage;
  return (
    <section
      id={now.id}
      aria-labelledby="now-title"
      className="ds-wrap pf-about-page__section"
    >
      <SectionHeader
        eyebrow={now.eyebrow}
        title={now.heading}
        titleId="now-title"
        titleMaxWidth={16}
      />
      <div className="t-body pf-about-page__prose">
        <RichParagraphs paragraphs={now.paragraphs} />
      </div>
    </section>
  );
}

function StackSection() {
  const { stack } = aboutPage;
  return (
    <section
      id={stack.id}
      aria-labelledby="stack-title"
      className="ds-wrap pf-about-page__section"
    >
      <SectionHeader
        eyebrow={stack.eyebrow}
        title={stack.heading}
        titleId="stack-title"
        lead={stack.lede}
        titleMaxWidth={16}
      />
      <div className="pf-about-page__grid">
        {stack.groups.map((group, index) => {
          const labelId = `stack-group-${index}`;
          return (
            <div key={group.label} className="ds-tile pf-about-page__tile">
              <h3 id={labelId} className="t-meta pf-about-page__label">
                {group.label}
              </h3>
              <ul aria-labelledby={labelId} className="pf-about-page__chips">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <Chip>{item.name}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="pf-about-page__more">
        <TextLink href={stack.moreHref}>{stack.moreLabel}</TextLink>
      </p>
    </section>
  );
}

/**
 * The solopreneur operating model: four stages ("#how-i-ship"), each headed
 * by one of the four principles. The stage list is "#principles", the
 * anchor /learn links for them (UX sweep 21-11-26).
 */
function OperatingModelSection() {
  const model = operatingModel;
  return (
    <section
      id="how-i-ship"
      aria-labelledby="ship-title"
      className="ds-wrap pf-about-page__section"
    >
      <SectionHeader
        eyebrow={model.eyebrow}
        title={model.heading}
        titleId="ship-title"
        lead={model.intro}
        titleMaxWidth={16}
      />
      <ol id="principles" className="pf-about-page__grid">
        {model.stages.map((stage, index) => (
          <li key={stage.id} className="ds-tile pf-about-page__tile">
            <p className="t-meta pf-about-page__label">
              {pad2(index + 1)} · {stage.label}
            </p>
            <h3 className="t-card-title pf-about-page__stage">
              {stage.principle}
            </h3>
            <p className="t-small pf-about-page__text">{stage.practice}</p>
            <ul
              aria-label={`${stage.label} skills`}
              className="pf-about-page__chips"
            >
              {stage.skills.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/skills/${slug}`}
                    className="ds-chip pf-about-page__skill"
                  >
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="t-small pf-about-page__seen">
              Seen in:{" "}
              {stage.evidence.map((link, at) => (
                <Fragment key={link.href}>
                  {at > 0 ? ", " : null}
                  <Link href={link.href} className="ds-prose-link">
                    {link.label}
                  </Link>
                </Fragment>
              ))}
            </p>
          </li>
        ))}
      </ol>
      <p className="pf-about-page__more">
        <TextLink href={model.markdownHref}>
          Reuse the model (Markdown)
        </TextLink>
      </p>
    </section>
  );
}

/**
 * FAQ: a native disclosure per question, the first one open. Every answer
 * stays in the HTML, so the page text matches the FAQPage JSON-LD, and
 * printing opens them all (FaqList, shared with the topic hubs).
 */
function FaqTile() {
  const { faq } = aboutPage;
  return (
    <section
      id={faq.id}
      aria-labelledby="faq-title"
      className="pf-about-page__faq"
    >
      <SectionHeader
        eyebrow={faq.eyebrow}
        title={faq.heading}
        titleId="faq-title"
        titleMaxWidth={16}
      />
      <FaqList items={FAQ_ITEMS} />
    </section>
  );
}

/**
 * Next: where to go from here, Contact first, and what a recruiter asks first
 * (recruiter-fit phase 2): the time zone and the links. That the owner is not
 * looking now (20-11-26) is the Now section's to say (UX sweep 21-11-26).
 */
function NextTile() {
  const { cta } = aboutPage;
  const [primary, ...others] = cta.links;
  return (
    <article
      aria-labelledby="about-next"
      className="ds-tile ds-tile--tint pf-about-page__next"
    >
      <h2 id="about-next" className="t-meta pf-about-page__label">
        {cta.eyebrow}
      </h2>
      <p className="t-h3 pf-about-page__next-title">{cta.heading}</p>
      <p className="t-small pf-about-page__text">{cta.body}</p>
      <div className="pf-about-page__recruit">
        <h3 className="t-meta pf-about-page__label">
          {contactPage.recruiterTitle}
        </h3>
        <RecruiterLines availability={false} />
        <RecruiterLinks links={aboutRecruiterLinks} />
      </div>
      <div className="pf-about-page__next-actions">
        <Pill href={primary.href} arrow="swap">
          {primary.label}
        </Pill>
        <ul className="pf-about-page__next-links">
          {others.map((link) => (
            <li key={link.href}>
              <TextLink href={link.href}>{link.label}</TextLink>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutBento principles={false} />
      <StorySection />
      <NowSection />
      <StackSection />
      <OperatingModelSection />
      <div className="ds-wrap pf-about-page__activity">
        <ContributionActivity />
      </div>
      <div className="ds-wrap pf-about-page__close">
        <FaqTile />
        <NextTile />
      </div>
    </>
  );
}
