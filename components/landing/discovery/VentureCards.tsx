import { useState, type ReactNode } from "react";
import {
  BentoCard,
  Kicker,
  CardLink,
  bentoSpan,
  type BentoSpan,
} from "@/components/bento/Bento";
import { ICON_BUTTON, CARD_SURFACE } from "@/components/bento/classes";
import {
  CheckIcon,
  LinkIcon,
  LinkedInLogoIcon,
  MailIcon,
  MoreIcon,
  XLogoIcon,
} from "@/components/bento/icons";
import {
  shareLinks,
  shareUrlLabel,
  useCanShare,
  type ShareTarget,
} from "@/components/bento/ShareRows";
import { splitLead } from "@/components/landing/discovery/hubLayout";
import LinkRows, {
  type HubLink,
} from "@/components/landing/discovery/LinkRows";
import { hero } from "@/lib/content/landing";
import type { Venture } from "@/lib/content/ventures";
import { writeClipboard } from "@/lib/utils/clipboard";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * Venture hub cards (bento canvas, design spec 4.7). Every value comes from
 * lib/content/ventures.ts; only the card labels are canvas microcopy. Blocks
 * with no data are left out (Manut has no metrics and no core loop).
 */

/**
 * Headline figures as stat tiles; each tile lifts on its own (`bento-row`).
 * A running total prints the month it was true under its label, and takes a
 * wide tile: three short figures fill the first row at 1000 px and the totals
 * share the second, so a long figure stays on one line.
 */
export function VentureStats({
  metrics,
}: {
  metrics: NonNullable<Venture["metrics"]>;
}) {
  return (
    <dl className={cn("bento-row m-0 flex flex-wrap gap-5", bentoSpan(3))}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={cn(
            "flex min-w-0 flex-col-reverse gap-2 rounded-bento border border-hairline bg-surface px-6 pt-[22px] pb-5 shadow-card",
            metric.asOf ? "flex-[1_1_360px]" : "flex-[1_1_180px]",
          )}
        >
          <dt className="font-mono text-xs tracking-[0.06em] text-ink-2 uppercase">
            {metric.label}
            {metric.asOf ? (
              <span className="mt-1 block">As of {metric.asOf}</span>
            ) : null}
          </dt>
          <dd className="m-0 text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] tabular-nums">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type Section = { heading: string; body: string };

/**
 * A case-study section as a card: the heading as its kicker, a short first
 * sentence as the 24 px lead ("Founder."), the rest as body text.
 */
export function SectionCard({
  id,
  section,
  span = 1,
  children,
}: {
  id: string;
  section: Section;
  span?: BentoSpan;
  children?: ReactNode;
}) {
  const { lead, rest } = splitLead(section.body);
  const wide = span > 1;
  return (
    <BentoCard
      headingId={id}
      title={section.heading}
      span={span}
      gap={wide ? 4 : 3.5}
    >
      {lead ? (
        <p className="mx-1 mt-1.5 mb-0 text-2xl leading-[1.25] font-semibold tracking-[-0.02em]">
          {lead}
        </p>
      ) : null}
      <p
        className={cn(
          "mx-1 my-0 leading-[1.6] text-ink-2",
          wide ? "max-w-[560px] text-base" : "text-card",
        )}
      >
        {rest}
      </p>
      {children}
    </BentoCard>
  );
}

/** The venture's category chips, pinned to the bottom of "What it is". */
export function CategoryChips({ items }: { items: readonly string[] }) {
  return (
    <ul
      aria-label="Categories"
      className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0 pt-1"
    >
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-surface-tint px-2.5 py-1.5 font-mono text-xs text-ink-2"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

const DIAL_RADIUS = 80;
/** Degrees left blank at each end of a dial segment (the canvas gap). */
const DIAL_GAP = 7;

/** SVG arc for segment `index` of `count`, clockwise from 12 o'clock. */
export function loopArc(index: number, count: number): string {
  const step = 360 / count;
  const point = (degrees: number) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    const x = 100 + DIAL_RADIUS * Math.cos(radians);
    const y = 100 + DIAL_RADIUS * Math.sin(radians);
    return `${Number(x.toFixed(2))} ${Number(y.toFixed(2))}`;
  };
  const start = index * step + DIAL_GAP;
  const end = (index + 1) * step - DIAL_GAP;
  const large = end - start > 180 ? 1 : 0;
  return `M${point(start)}A${DIAL_RADIUS} ${DIAL_RADIUS} 0 ${large} 1 ${point(end)}`;
}

/**
 * The core loop (bento canvas "Where it stands"): pressed step buttons and a
 * dial whose accent segment turns forward to the chosen stage. Local state;
 * the stage name is announced from the dial's live region.
 */
export function LoopStepper({ stages }: { stages: readonly string[] }) {
  const [{ stage, spin }, setState] = useState({ stage: 0, spin: 0 });
  const count = stages.length;
  const arcs = stages.map((_, i) => loopArc(i, count));

  const select = (next: number) =>
    setState((current) => ({
      stage: next,
      // Always turn forward, the way the loop runs.
      spin:
        current.spin + ((next - current.stage + count) % count) * (360 / count),
    }));

  return (
    <div className="mt-auto grid grid-cols-1 gap-4 min-[641px]:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <p
          id="loop-label"
          className="mx-1 my-0 font-mono text-xs tracking-[0.06em] text-ink-2 uppercase"
        >
          The core loop
        </p>
        <div
          role="group"
          aria-labelledby="loop-label"
          className="flex flex-col gap-1 rounded-[22px] border border-hairline bg-page p-[5px]"
        >
          {stages.map((label, i) => {
            const on = i === stage;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => select(i)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-2xl border-0 px-3.5 text-left text-card font-medium",
                  on ? "bg-cta text-on-cta" : "bg-transparent text-ink-2",
                )}
              >
                <span className="font-mono text-xs">{pad2(i + 1)}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[22px] border border-hairline bg-page">
        <div className="relative size-[188px]">
          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            fill="none"
            stroke="var(--hairline-strong)"
            strokeWidth={12}
            strokeLinecap="round"
            className="absolute inset-0 size-full"
          >
            {arcs.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
          <div
            aria-hidden
            className="absolute inset-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ transform: `rotate(${spin}deg)` }}
          >
            <svg
              viewBox="0 0 200 200"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={12}
              strokeLinecap="round"
              className="block size-full"
            >
              <path d={arcs[0]} />
            </svg>
          </div>
          <div
            aria-live="polite"
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-9 text-center"
          >
            <p className="m-0 font-mono text-xs text-ink-2">
              {pad2(stage + 1)} / {pad2(count)}
            </p>
            <p className="m-0 text-xl leading-[1.2] font-semibold tracking-[-0.02em]">
              {stages[stage]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "My role" footer: the founder's headshot and name, then About. */
export function RoleFooter() {
  return (
    <div className="mt-auto flex items-center gap-3 border-t border-hairline pt-3">
      <img
        src={hero.portraitSrc}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        className="size-10 shrink-0 rounded-tile object-cover"
      />
      <span className="text-sm font-medium">
        {hero.name.replace(/\.$/, "")}
      </span>
      <CardLink href="/about" className="ml-auto">
        About →
      </CardLink>
    </div>
  );
}

/** Related topics: a small map drawing over the topic rows. */
export function RelatedTopicsCard({ links }: { links: readonly HubLink[] }) {
  return (
    <BentoCard headingId="card-related" title="Related topics" gap={3.5}>
      <div
        aria-hidden
        className="relative h-[104px] shrink-0 overflow-hidden rounded-[18px] border border-hairline bg-page"
      >
        <svg
          viewBox="0 0 280 104"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
        >
          <g stroke="var(--map)" strokeWidth={1} fill="none">
            <path d="M0 18h280M0 46h280M0 74h280M0 100h280" />
            <path d="M24 0v104M58 0v104M92 0v104M126 0v104M160 0v104M194 0v104M228 0v104M262 0v104" />
            <path d="M-10 96L290 8M40 -10L170 114" strokeWidth={2} />
          </g>
          <path
            d="M150 -10C126 22 184 38 162 58S118 82 136 114"
            stroke="var(--river)"
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
          <rect x="150" y="50" width="9" height="9" fill="var(--accent)" />
        </svg>
      </div>
      <LinkRows links={links} size="sm" />
      <CardLink href="/learn" className="mt-auto self-end">
        All topics →
      </CardLink>
    </BentoCard>
  );
}

/** Also building: the other venture, with its case study and site. */
export function AlsoBuildingCard({ venture }: { venture: Venture }) {
  return (
    <BentoCard headingId="card-next" title="Also building" gap={3.5}>
      <div className="mt-1.5 flex items-center gap-3.5">
        <img
          src={venture.logo}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          className="size-16 shrink-0 rounded-[18px] border border-hairline bg-paper object-cover"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="m-0 text-xl font-semibold tracking-[-0.02em]">
            {venture.name}
          </h3>
          {venture.caseStudy ? (
            <p className="m-0 font-mono text-xs text-ink-2">
              {venture.caseStudy.timeline}
            </p>
          ) : null}
        </div>
      </div>
      <p className="mx-1 my-0 text-card leading-[1.55] text-ink-2">
        {venture.tagline}
      </p>
      <div className="mt-auto flex flex-wrap justify-between gap-x-4">
        <CardLink href={`/ventures/${venture.slug}`}>Case study →</CardLink>
        <a
          href={venture.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-medium no-underline"
        >
          {venture.urlLabel} →
        </a>
      </div>
    </BentoCard>
  );
}

/**
 * Share (span 3): the page title and URL, a Copy link pill and the X,
 * LinkedIn, email and native-sheet icon buttons. "Link copied" stays until
 * the card remounts; the native sheet shows only where it exists.
 */
export function VentureShareCard({ target }: { target: ShareTarget }) {
  const canShare = useCanShare();
  const [copied, setCopied] = useState(false);
  const links = shareLinks(target);

  return (
    <article
      aria-labelledby="card-share"
      className={cn(
        CARD_SURFACE,
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        bentoSpan(3),
      )}
    >
      <div className="flex min-w-0 flex-[1_1_320px] flex-col items-start gap-2.5">
        <Kicker id="card-share">Share</Kicker>
        <p className="mx-1 mt-0.5 mb-0 text-base leading-[1.35] font-semibold">
          {target.title}
        </p>
        <p className="mx-1 my-0 max-w-full truncate font-mono text-xs text-ink-2">
          {shareUrlLabel(target.url)}
        </p>
      </div>
      <div className="flex flex-[0_1_auto] flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            void writeClipboard(target.url).then((ok) => setCopied(ok));
          }}
          className="kj-row inline-flex min-h-12 flex-auto items-center justify-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-5 text-card font-medium text-ink"
        >
          {copied ? <CheckIcon className="text-mark" /> : <LinkIcon />}
          <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
        </button>
        <div className="flex gap-2">
          <a
            className={ICON_BUTTON}
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Post on X"
          >
            <XLogoIcon />
          </a>
          <a
            className={ICON_BUTTON}
            href={links.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <LinkedInLogoIcon />
          </a>
          <a
            className={ICON_BUTTON}
            href={links.mail}
            aria-label="Email the link"
          >
            <MailIcon />
          </a>
          {canShare ? (
            <button
              type="button"
              className={ICON_BUTTON}
              aria-label="More share options"
              onClick={() => {
                navigator.share(target).catch(() => {
                  // Dismissed or unsupported for this data: nothing to do.
                });
              }}
            >
              <MoreIcon />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
