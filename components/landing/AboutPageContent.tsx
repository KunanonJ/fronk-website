import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { ArrowUpRight, Plus } from "lucide-react";
import { AnnotatedText } from "@/components/landing/AnnotatedText";
import ContributionActivity from "@/components/landing/ContributionActivity";
import StackBrandIcon from "@/components/landing/StackBrandIcon";
import {
  aboutPage,
  type AboutInline,
  type AboutParagraph,
} from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";

function InlineSpan({ span }: { span: AboutInline }) {
  if (span.type === "text") {
    return <AnnotatedText text={span.text} />;
  }

  // py-0.5 lifts inline links to a 24 px+ hit area without changing layout.
  const className =
    "py-0.5 text-link underline decoration-link/40 underline-offset-4 transition-colors hover:decoration-link";

  if (span.external) {
    return (
      <a href={span.href} target="_blank" rel="noopener noreferrer" className={className}>
        {span.text}
      </a>
    );
  }

  return (
    <Link href={span.href} className={className}>
      {span.text}
    </Link>
  );
}

function RichParagraphs({ paragraphs }: { paragraphs: readonly AboutParagraph[] }) {
  return (
    <div className="space-y-5 text-body text-ink-2">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.spans.map((span, j) => (
            <InlineSpan key={j} span={span} />
          ))}
        </p>
      ))}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-mono text-label uppercase text-ink-2">{children}</p>;
}

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-6 font-display text-h2 text-ink">
      {children}
    </h2>
  );
}

const SECTION = "mt-16 scroll-mt-28 border-t border-hairline pt-16 sm:mt-20 sm:pt-20";
const MORE_LINK =
  "group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-link underline-offset-4 hover:underline";

/**
 * Below-fold About content: story, principles, now, activity, stack, path,
 * FAQ and CTAs (visual-redesign Phase 3). Copy from lib/content/aboutPage;
 * the FAQ text must stay identical to FAQ_ITEMS, which also feeds the FAQPage
 * JSON-LD.
 */
export default function AboutPageContent() {
  const { story, principles, now, stack, path, faq, cta } = aboutPage;
  const jumpLinks = [
    { id: story.id, label: "Story" },
    { id: principles.id, label: principles.eyebrow },
    { id: now.id, label: now.eyebrow },
    { id: stack.id, label: "Stack" },
    { id: path.id, label: "Path" },
    { id: faq.id, label: faq.eyebrow },
  ];

  return (
    <div className="relative border-t border-hairline bg-page text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24">
        {/* Jump list (ux-audit finding 14): plain anchors, scrolls sideways on phones. */}
        <nav aria-label="On this page" className="-mx-4 mb-12 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2">
            {jumpLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-hairline-strong bg-surface px-3.5 text-small text-ink-2 transition-colors hover:border-ink/40 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Story */}
        <section id={story.id} aria-labelledby="about-story-heading" className="scroll-mt-28">
          <SectionEyebrow>{story.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-story-heading">{story.heading}</SectionHeading>
          <p className="mt-4 mb-5 text-lead text-ink">{story.whoIs}</p>
          <RichParagraphs paragraphs={story.paragraphs} />
        </section>

        {/* Principles */}
        <section id={principles.id} aria-labelledby="about-principles-heading" className={SECTION}>
          <SectionEyebrow>{principles.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-principles-heading">{principles.heading}</SectionHeading>
          <ul className="grid gap-4">
            {principles.items.map((item) => (
              <li
                key={item.title}
                className="rounded-card border border-hairline bg-surface p-5 shadow-card sm:p-6"
              >
                <p className="text-lead font-medium text-ink">{item.title}</p>
                <p className="mt-2 text-body text-ink-2">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Now */}
        <section id={now.id} aria-labelledby="about-now-heading" className={SECTION}>
          <SectionEyebrow>{now.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-now-heading">{now.heading}</SectionHeading>
          <RichParagraphs paragraphs={now.paragraphs} />
        </section>

        <ContributionActivity />

        {/* Tech stack, grounded in public GitHub */}
        <section id={stack.id} aria-labelledby="about-stack-heading" className={SECTION}>
          <SectionEyebrow>{stack.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-stack-heading">{stack.heading}</SectionHeading>
          <p className="mb-8 text-body text-ink-2">{stack.lede}</p>
          <div className="space-y-8">
            {stack.groups.map((group) => (
              <div key={group.label}>
                <p className="mb-3 font-mono text-label uppercase text-ink-2">{group.label}</p>
                <ul className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-surface py-1.5 pr-4 pl-1.5"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-tint text-ink">
                        <StackBrandIcon id={item.icon} title={item.name} className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-small font-medium text-ink">{item.name}</span>
                      <span className="text-xs text-ink-2">{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href={stack.moreHref} className={MORE_LINK}>
              {stack.moreLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Path */}
        <section id={path.id} aria-labelledby="about-path-heading" className={SECTION}>
          <SectionEyebrow>{path.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-path-heading">{path.heading}</SectionHeading>
          <ul className="flex flex-wrap gap-2.5">
            {path.chips.map((chip) => (
              <li
                key={chip.label}
                className="rounded-full border border-hairline-strong bg-surface px-4 py-2"
              >
                <span className="text-small font-medium text-ink">{chip.label}</span>
                <span className="ml-2 text-xs text-ink-2">{chip.detail}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link href={path.resumeHref} className={MORE_LINK}>
              {path.resumeLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* FAQ: a no-JS accordion; text identical to FAQ_ITEMS (FAQPage JSON-LD). */}
        <section id={faq.id} aria-labelledby="about-faq-heading" className={SECTION}>
          <SectionEyebrow>{faq.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-faq-heading">{faq.heading}</SectionHeading>
          <div className="border-t border-hairline">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={item.question}
                className="group border-b border-hairline"
                open={index === 0}
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <Plus
                    className="h-4 w-4 shrink-0 text-ink-2 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="pb-5 text-body text-ink-2">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="about-cta-heading" className={`${SECTION} text-center`}>
          <SectionEyebrow>{cta.eyebrow}</SectionEyebrow>
          <h2 id="about-cta-heading" className="mb-4 font-display text-h2 text-ink">
            {cta.heading}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-body text-ink-2">{cta.body}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {cta.links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  index === 0
                    ? "inline-flex min-h-11 items-center gap-2 rounded-full bg-action px-5 text-sm font-medium text-on-action transition-colors hover:bg-action-hover"
                    : "inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline-strong bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-tint"
                }
              >
                {link.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
