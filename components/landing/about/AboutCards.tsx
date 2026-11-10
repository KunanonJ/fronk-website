import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { BentoCard, CardLink, CardTitle } from "@/components/bento/Bento";
import { CtaLink } from "@/components/bento/Buttons";
import { ArrowUpRightIcon, PlusIcon } from "@/components/bento/icons";
import {
  aboutPage,
  type AboutInline,
  type AboutParagraph,
} from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { operatingModel } from "@/lib/content/operatingModel";
import { cn } from "@/lib/utils/cn";

/*
 * About bento cards (bento canvas, design spec 4.2). Copy comes from
 * lib/content/aboutPage; the FAQ from lib/content/faq, which also feeds the
 * FAQPage JSON-LD, so the visible answers and the schema never drift. The
 * section ids (#story, #principles, #now, #stack, #path, #faq) are linked
 * from Learn's operator notes and the hero, so they stay as they were.
 */

const INLINE_LINK = "underline decoration-hairline-strong underline-offset-4";

function InlineSpan({ span }: { span: AboutInline }) {
  if (span.type === "text") return span.text;
  if (span.external) {
    return (
      <a
        href={span.href}
        target="_blank"
        rel="noopener noreferrer"
        className={INLINE_LINK}
      >
        {span.text}
      </a>
    );
  }
  return (
    <Link href={span.href} className={INLINE_LINK}>
      {span.text}
    </Link>
  );
}

function RichParagraphs({
  paragraphs,
  className,
}: {
  paragraphs: readonly AboutParagraph[];
  className: string;
}) {
  return paragraphs.map((paragraph, i) => (
    <p key={i} className={cn("m-0", className)}>
      {paragraph.spans.map((span, j) => (
        <InlineSpan key={j} span={span} />
      ))}
    </p>
  ));
}

/** Story (2 columns): the who-is answer block, then the longer story. */
export function StoryCard() {
  const { story } = aboutPage;
  return (
    <BentoCard
      id={story.id}
      headingId="card-story"
      title={story.eyebrow}
      span={2}
      minHeight={false}
      className="scroll-mt-6 pb-6"
    >
      <div className="flex flex-col gap-3.5 px-1">
        <CardTitle size="lg">{story.heading}</CardTitle>
        <p className="m-0 text-[17px] leading-[1.55] text-ink">{story.whoIs}</p>
        <RichParagraphs
          paragraphs={story.paragraphs}
          className="text-card leading-[1.65] text-ink-2"
        />
      </div>
    </BentoCard>
  );
}

/** Selected path: the career arc on a vertical line, current step marked. */
export function PathCard() {
  const { path } = aboutPage;
  const last = path.chips.length - 1;
  return (
    <BentoCard
      id={path.id}
      headingId="card-path"
      title={path.eyebrow}
      minHeight={false}
      className="scroll-mt-6"
    >
      <CardTitle className="px-1">{path.heading}</CardTitle>
      <div className="relative mt-1 flex flex-1 flex-col">
        <span
          aria-hidden
          className="absolute top-[18px] bottom-[18px] left-1 w-px bg-hairline-strong"
        />
        <ol className="relative m-0 flex flex-1 list-none flex-col justify-between gap-2.5 p-0">
          {path.chips.map((chip, index) => (
            <li key={chip.label} className="flex items-center gap-3.5">
              <span
                aria-hidden
                className={cn(
                  "size-[9px] shrink-0 shadow-[0_0_0_4px_var(--surface)]",
                  index === last ? "bg-mark" : "bg-ink",
                )}
              />
              <span className="inline-flex flex-wrap items-baseline gap-x-2 rounded-full border border-hairline-strong bg-page px-3.5 py-2">
                <span className="text-sm font-medium">{chip.label}</span>
                <span className="text-xs text-ink-2">{chip.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <CardLink href={path.resumeHref} className="self-end">
        {path.resumeLabel} →
      </CardLink>
    </BentoCard>
  );
}

/** How I work (full width): the four principles as numbered wells. */
export function PrinciplesCard() {
  const { principles } = aboutPage;
  return (
    <BentoCard
      id={principles.id}
      headingId="card-principles"
      title={principles.eyebrow}
      span={3}
      minHeight={false}
      className="scroll-mt-6"
    >
      <CardTitle className="px-1">{principles.heading}</CardTitle>
      <ol className="bento-2 m-0 grid list-none grid-cols-1 gap-3 p-0 min-[641px]:grid-cols-2">
        {principles.items.map((item, index) => (
          <li
            key={item.title}
            className="flex flex-col gap-2.5 rounded-well border border-hairline bg-page px-5 pt-[18px] pb-5"
          >
            <span className="font-mono text-meta text-mark">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="m-0 text-[17px] leading-[1.35] font-semibold tracking-[-0.01em]">
              {item.title}
            </p>
            <p className="m-0 text-card leading-[1.55] text-ink-2">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </BentoCard>
  );
}

/**
 * Solopreneur operating model: four stages, each with its principle, the
 * skills that run it and the shipped work that shows it. The same model is
 * published as /operating-model.md for reuse in other projects.
 */
export function OperatingModelCard() {
  const model = operatingModel;
  return (
    <BentoCard
      id="how-i-ship"
      headingId="card-operating-model"
      title={model.eyebrow}
      span={3}
      minHeight={false}
      className="scroll-mt-6"
    >
      <div className="flex flex-col gap-2.5 px-1">
        <CardTitle>{model.heading}</CardTitle>
        <p className="m-0 max-w-[620px] text-card leading-[1.6] text-ink-2">
          {model.intro}
        </p>
      </div>
      <ol className="bento-2 m-0 grid list-none grid-cols-1 gap-3 p-0 min-[641px]:grid-cols-2">
        {model.stages.map((stage, index) => (
          <li
            key={stage.id}
            className="flex flex-col gap-2.5 rounded-well border border-hairline bg-page px-5 pt-[18px] pb-5"
          >
            <p className="m-0 font-mono text-meta text-mark">
              {String(index + 1).padStart(2, "0")} · {stage.label}
            </p>
            <p className="m-0 text-[17px] leading-[1.35] font-semibold tracking-[-0.01em]">
              {stage.principle}
            </p>
            <p className="m-0 text-card leading-[1.55] text-ink-2">
              {stage.practice}
            </p>
            <ul
              aria-label={`${stage.label} skills`}
              className="m-0 flex list-none flex-wrap gap-1.5 p-0"
            >
              {stage.skills.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/skills/${slug}`}
                    className="inline-flex min-h-7 items-center rounded-full border border-hairline-strong bg-surface px-2.5 font-mono text-xs text-ink no-underline hover:border-ink"
                  >
                    {slug}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-auto text-meta text-ink-2">
              Seen in:{" "}
              {stage.evidence.map((link, i) => (
                <span key={link.href}>
                  {i > 0 ? ", " : null}
                  <Link
                    href={link.href}
                    className="text-link underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>
      <CardLink href={model.markdownHref} className="self-end">
        Reuse the model (Markdown) →
      </CardLink>
    </BentoCard>
  );
}

/** Now: what the work is this year. */
export function NowCard() {
  const { now } = aboutPage;
  return (
    <BentoCard
      id={now.id}
      headingId="card-now"
      title={now.eyebrow}
      minHeight={false}
      className="scroll-mt-6"
    >
      <div className="flex flex-col gap-3 px-1">
        <CardTitle>{now.heading}</CardTitle>
        <RichParagraphs
          paragraphs={now.paragraphs}
          className="text-card leading-[1.6] text-ink-2"
        />
      </div>
    </BentoCard>
  );
}

/** Tech stack (full width): the four groups as wells of name chips. */
export function StackCard() {
  const { stack } = aboutPage;
  return (
    <BentoCard
      id={stack.id}
      headingId="card-stack"
      title={stack.eyebrow}
      span={3}
      minHeight={false}
      className="scroll-mt-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2.5 px-1">
        <CardTitle>{stack.heading}</CardTitle>
        <p className="m-0 max-w-[520px] text-card leading-[1.6] text-ink-2">
          {stack.lede}
        </p>
      </div>
      <div className="bento-2 grid grid-cols-1 gap-3 min-[641px]:grid-cols-2">
        {stack.groups.map((group, index) => {
          const labelId = `stack-group-${index}`;
          return (
            <div
              key={group.label}
              className="flex flex-col gap-3 rounded-well border border-hairline bg-page px-[18px] pt-4 pb-[18px]"
            >
              <p
                id={labelId}
                className="m-0 font-mono text-xs tracking-[0.06em] text-ink-2 uppercase"
              >
                {group.label}
              </p>
              <ul
                aria-labelledby={labelId}
                className="m-0 flex list-none flex-wrap gap-2 p-0"
              >
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="inline-flex min-h-[34px] items-center rounded-full border border-hairline-strong bg-surface px-3.5 text-sm font-medium"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <CardLink href={stack.moreHref} className="self-end">
        {stack.moreLabel} →
      </CardLink>
    </BentoCard>
  );
}

/**
 * FAQ: a disclosure per question (h4 > button[aria-expanded]), first one
 * open. Closed answers stay in the HTML (`hidden`), so the page text always
 * matches the FAQPage JSON-LD.
 */
export function FaqCard({ className }: { className?: string }) {
  const { faq } = aboutPage;
  return (
    <BentoCard
      id={faq.id}
      headingId="card-faq"
      title={faq.eyebrow}
      minHeight={false}
      className={cn("scroll-mt-6", className)}
    >
      <CardTitle className="px-1">{faq.heading}</CardTitle>
      {/* Native disclosures: every answer stays in the HTML (no `hidden`), so
          answer engines and text extractors read all of them. */}
      <div className="border-t border-hairline">
        {FAQ_ITEMS.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group border-b border-hairline"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-1 py-3.5 text-left text-base leading-[1.4] font-medium text-ink [&::-webkit-details-marker]:hidden">
              <h4 className="m-0 text-base font-medium">{item.question}</h4>
              <PlusIcon className="shrink-0 transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <div className="pt-0 pr-10 pb-[18px] pl-1">
              <p className="m-0 text-card leading-[1.6] [overflow-wrap:anywhere] text-ink-2">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </BentoCard>
  );
}

function CtaArrow({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ArrowUpRightIcon />
    </>
  );
}

/** Next: where to go from here, Contact first. */
export function NextCard({ className }: { className?: string }) {
  const { cta } = aboutPage;
  const [primary, ...others] = cta.links;
  return (
    <BentoCard
      headingId="card-next"
      title={cta.eyebrow}
      minHeight={false}
      className={className}
    >
      <div className="flex flex-col gap-3 px-1">
        <CardTitle size="xl">{cta.heading}</CardTitle>
        <p className="m-0 text-card leading-[1.6] text-ink-2">{cta.body}</p>
      </div>
      <div className="mt-auto flex flex-col gap-2.5 pt-3">
        <CtaLink href={primary.href} size="md">
          <CtaArrow>{primary.label}</CtaArrow>
        </CtaLink>
        <div className="grid grid-cols-2 gap-2.5">
          {others.map((link) => (
            <CtaLink
              key={link.href}
              href={link.href}
              variant="secondary"
              size="sm"
            >
              <CtaArrow>{link.label}</CtaArrow>
            </CtaLink>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
