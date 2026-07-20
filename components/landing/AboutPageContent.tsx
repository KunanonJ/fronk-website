import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnnotatedText } from "@/components/landing/AnnotatedText";
import ContributionActivity from "@/components/landing/ContributionActivity";
import StackBrandIcon from "@/components/landing/StackBrandIcon";
import {
  aboutPage,
  type AboutInline,
  type AboutParagraph,
} from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

function InlineSpan({ span }: { span: AboutInline }) {
  if (span.type === "text") {
    return <AnnotatedText text={span.text} />;
  }

  const className =
    "text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary";

  if (span.external) {
    return (
      <a
        href={span.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
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

function RichParagraphs({
  paragraphs,
}: {
  paragraphs: readonly AboutParagraph[];
}) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-primary/75 sm:text-[1.05rem]">
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
  return (
    <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/55 sm:text-xs">
      {children}
    </p>
  );
}

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-6 text-3xl font-medium tracking-tight text-primary sm:text-4xl"
      style={serif}
    >
      {children}
    </h2>
  );
}

/**
 * Below-fold About content — story, principles, now, path, FAQ, CTAs.
 * Landing CI (black + cream); copy from lib/content/aboutPage.
 */
export default function AboutPageContent() {
  const { story, principles, now, stack, path, faq, cta } = aboutPage;

  return (
    <div className="relative border-t border-black/10 bg-landing text-primary dark:border-white/10">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24">
        {/* Story */}
        <section
          id={story.id}
          aria-labelledby="about-story-heading"
          className="scroll-mt-28"
        >
          <SectionEyebrow>{story.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-story-heading">
            {story.heading}
          </SectionHeading>
          <RichParagraphs paragraphs={story.paragraphs} />
        </section>

        {/* Principles */}
        <section
          id={principles.id}
          aria-labelledby="about-principles-heading"
          className="mt-16 border-t border-white/10 pt-16 sm:mt-20 sm:pt-20"
        >
          <SectionEyebrow>{principles.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-principles-heading">
            {principles.heading}
          </SectionHeading>
          <ul className="space-y-6">
            {principles.items.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <p className="text-base font-medium text-primary sm:text-lg">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-primary/65 sm:text-base">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Now */}
        <section
          id={now.id}
          aria-labelledby="about-now-heading"
          className="mt-16 border-t border-white/10 pt-16 sm:mt-20 sm:pt-20"
        >
          <SectionEyebrow>{now.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-now-heading">{now.heading}</SectionHeading>
          <RichParagraphs paragraphs={now.paragraphs} />
        </section>

        <ContributionActivity />

        {/* Tech stack — grounded in public GitHub */}
        <section
          id={stack.id}
          aria-labelledby="about-stack-heading"
          className="mt-16 border-t border-white/10 pt-16 sm:mt-20 sm:pt-20"
        >
          <SectionEyebrow>{stack.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-stack-heading">
            {stack.heading}
          </SectionHeading>
          <p className="mb-8 text-sm leading-relaxed text-primary/65 sm:text-base">
            {stack.lede}
          </p>
          <div className="space-y-8">
            {stack.groups.map((group) => (
              <div key={group.label}>
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-primary/45">
                  {group.label}
                </p>
                <ul className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item.name}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-2 pl-2.5 pr-4"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <StackBrandIcon
                          id={item.icon}
                          title={item.name}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {item.name}
                      </span>
                      <span className="text-xs text-primary/50">
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href={stack.moreHref}
              className="group inline-flex items-center gap-2 text-sm text-primary/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {stack.moreLabel}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* Path */}
        <section
          id={path.id}
          aria-labelledby="about-path-heading"
          className="mt-16 border-t border-white/10 pt-16 sm:mt-20 sm:pt-20"
        >
          <SectionEyebrow>{path.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-path-heading">{path.heading}</SectionHeading>
          <ul className="flex flex-wrap gap-2.5">
            {path.chips.map((chip) => (
              <li
                key={chip.label}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2"
              >
                <span className="text-sm font-medium text-primary">
                  {chip.label}
                </span>
                <span className="ml-2 text-xs text-primary/50">
                  {chip.detail}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link
              href={path.resumeHref}
              className="group inline-flex items-center gap-2 text-sm text-primary/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {path.resumeLabel}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section
          id={faq.id}
          aria-labelledby="about-faq-heading"
          className="mt-16 border-t border-white/10 pt-16 sm:mt-20 sm:pt-20"
        >
          <SectionEyebrow>{faq.eyebrow}</SectionEyebrow>
          <SectionHeading id="about-faq-heading">{faq.heading}</SectionHeading>
          <dl className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <dt className="text-base font-medium text-primary">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-primary/65 sm:text-base">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section
          aria-labelledby="about-cta-heading"
          className="mt-16 border-t border-white/10 pt-16 text-center sm:mt-20 sm:pt-20"
        >
          <SectionEyebrow>{cta.eyebrow}</SectionEyebrow>
          <h2
            id="about-cta-heading"
            className="mb-4 text-3xl font-medium tracking-tight text-primary sm:text-4xl"
            style={serif}
          >
            {cta.heading}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-primary/65 sm:text-base">
            {cta.body}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {cta.links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  index === 0
                    ? "inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
                    : "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-white/40 hover:bg-white/10"
                }
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
