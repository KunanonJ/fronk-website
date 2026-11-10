import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { Bento, bentoSpan, type BentoSpan } from "@/components/bento/Bento";
import { EyebrowChip } from "@/components/bento/Chips";
import {
  CARD,
  Kicker,
  MONO_LABEL,
  TEXT_LINK,
  WELL,
  countLabel,
} from "@/components/landing/library/parts";
import type { BlogCard } from "@/lib/content/blog";
import {
  getLearnHubs,
  getLearnWritingLinks,
  learnOperatorNotes,
  learnPage,
  type LearnHub,
  type LearnLink,
} from "@/lib/content/learn";
import type { LearnLang } from "@/lib/library/search";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

const LANGS: readonly { id: LearnLang; label: string; code: string }[] = [
  { id: "en", label: "English", code: "EN" },
  { id: "th", label: "ไทย", code: "TH" },
];

const LANG_NAME: Record<LearnLang, string> = { en: "English", th: "Thai" };

/**
 * Hub cards in canvas order: the first leads at two columns with the square
 * steps art and the alternate-language link, the second takes one, the
 * third two with the river art. Title sizes follow the canvas per card.
 */
const HUB_LAYOUT: readonly {
  span: BentoSpan;
  minHeight: string;
  title: string;
  art?: "steps" | "river";
  altLink?: boolean;
}[] = [
  {
    span: 2,
    minHeight: "min-h-[340px]",
    title: "text-[clamp(26px,3.4vw,34px)]",
    art: "steps",
    altLink: true,
  },
  {
    span: 1,
    minHeight: "min-h-[320px]",
    title: "text-[clamp(22px,2.4vw,26px)]",
  },
  {
    span: 2,
    minHeight: "min-h-[320px]",
    title: "text-[clamp(24px,2.8vw,30px)]",
    art: "river",
  },
];

function StepsArt() {
  return (
    <svg
      aria-hidden
      width="132"
      height="40"
      viewBox="0 0 132 40"
      className="max-w-[40%] shrink-0"
    >
      <rect
        x="1"
        y="27"
        width="12"
        height="12"
        rx="3"
        fill="none"
        stroke="var(--hairline-strong)"
      />
      <rect
        x="21"
        y="21"
        width="18"
        height="18"
        rx="4"
        fill="none"
        stroke="var(--hairline-strong)"
      />
      <rect
        x="47"
        y="15"
        width="24"
        height="24"
        rx="5"
        fill="var(--surface-tint)"
      />
      <rect
        x="79"
        y="8"
        width="31"
        height="31"
        rx="6"
        fill="var(--surface-tint)"
      />
      <rect x="118" y="1" width="12" height="12" fill="var(--accent)" />
    </svg>
  );
}

function RiverArt() {
  return (
    <svg
      aria-hidden
      width="140"
      height="44"
      viewBox="0 0 140 44"
      className="max-w-[40%] shrink-0"
    >
      <path
        d="M8 34C40 34 46 10 78 10S118 26 134 22"
        fill="none"
        stroke="var(--river)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="2" y="28" width="12" height="12" fill="var(--accent)" />
      <circle
        cx="78"
        cy="10"
        r="4"
        fill="var(--surface)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
      <circle
        cx="132"
        cy="22"
        r="4"
        fill="var(--surface)"
        stroke="var(--hairline-strong)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** A topic hub in the chosen language. Thai opens its line heights (spec 1.6). */
/**
 * The layout for hub `index` of `count`. The first three follow the canvas;
 * later hubs continue the one-then-two rhythm, and a hub left alone on its row
 * spans the full width, so no row ends in an empty gap.
 */
export function hubLayout(index: number, count: number) {
  if (index < HUB_LAYOUT.length) return HUB_LAYOUT[index]!;
  const position = index - HUB_LAYOUT.length;
  const base = HUB_LAYOUT[1]!;
  if (position % 2 === 1) return { ...base, span: 2 as BentoSpan };
  const last = index === count - 1;
  return last ? { ...base, span: 3 as BentoSpan } : base;
}

function HubCard({
  hub,
  index,
  count,
}: {
  hub: LearnHub;
  index: number;
  count: number;
}) {
  const layout = hubLayout(index, count);
  const th = hub.lang === "th";
  const id = `hub-${hub.slug}`;
  return (
    <article
      aria-labelledby={id}
      className={cn(
        CARD,
        index === 0 ? "gap-3.5" : "gap-3",
        layout.minHeight,
        bentoSpan(layout.span),
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Kicker as="p">Topic hub · {pad2(index + 1)}</Kicker>
        {layout.art === "steps" ? <StepsArt /> : null}
        {layout.art === "river" ? <RiverArt /> : null}
      </div>
      <div
        className={cn(
          "mt-auto flex flex-col",
          index === 0 ? "gap-3" : "gap-2.5",
          layout.art === "river" && "max-w-[600px]",
        )}
      >
        {index === 0 ? (
          <p className="m-0 font-mono text-xs [overflow-wrap:anywhere] text-ink-2">
            {hub.lang.toUpperCase()} · {hub.href}
          </p>
        ) : null}
        <h2
          id={id}
          lang={hub.lang}
          className={cn(
            "m-0 font-semibold [overflow-wrap:anywhere] text-ink",
            layout.title,
            th
              ? "leading-[1.4] tracking-normal"
              : "leading-[1.16] tracking-[-0.03em]",
          )}
        >
          {hub.title}
        </h2>
        <p
          lang={hub.lang}
          className={cn(
            "m-0 max-w-[560px] text-card text-ink-2",
            th ? "leading-[1.75]" : "leading-[1.55]",
          )}
        >
          {hub.lede}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <Link href={hub.href} className={TEXT_LINK}>
          Open hub →
        </Link>
        {layout.altLink ? (
          <Link
            href={hub.alt.href}
            lang={hub.alt.lang}
            hrefLang={hub.alt.lang}
            className={TEXT_LINK}
          >
            {hub.alt.label} →
          </Link>
        ) : null}
      </div>
    </article>
  );
}

/** "Read the hubs in": the language switch for the hub cards. */
function LanguageCard({
  lang,
  count,
  onChange,
}: {
  lang: LearnLang;
  count: number;
  onChange: (next: LearnLang) => void;
}) {
  const code = LANGS.find((l) => l.id === lang)?.code;
  return (
    <article
      aria-labelledby="card-language"
      className={cn(CARD, "min-h-[340px] gap-3.5")}
    >
      <Kicker id="card-language">Read the hubs in</Kicker>
      <p
        aria-hidden
        className="m-0 mt-auto font-mono text-[64px] leading-none font-medium tracking-[-0.04em] text-ink"
      >
        {code}
        <span className="ml-2 inline-block size-2.5 bg-mark" />
      </p>
      <p aria-live="polite" className="m-0 text-sm text-ink-2">
        Showing {count} hubs in {LANG_NAME[lang]}
      </p>
      <div
        role="group"
        aria-label="Hub language"
        className="flex flex-col gap-1.5 rounded-sheet border border-hairline bg-page p-[5px]"
      >
        {LANGS.map((option) => {
          const on = option.id === lang;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex min-h-12 w-full items-center justify-between rounded-full border-0 px-[18px] text-left text-card font-medium",
                on ? "bg-cta text-on-cta" : "bg-transparent text-ink-2",
              )}
            >
              <span lang={option.id}>{option.label}</span>
              {/* Full strength: at the canvas's 80% the ink-2 code on the
                  page fill falls under 4.5:1 by day. */}
              <span aria-hidden className="font-mono text-xs">
                {option.code}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

/** Operator notes (and Writing, while the blog is public): numbered wells. */
function LinkListCard({
  id,
  title,
  unit,
  cta,
  items,
}: {
  id: string;
  title: string;
  unit: [one: string, many: string];
  cta: string;
  items: readonly LearnLink[];
}) {
  return (
    <article aria-labelledby={id} className={cn(CARD, "gap-4", bentoSpan(3))}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Kicker id={id}>{title}</Kicker>
        <span className={MONO_LABEL}>
          {countLabel(items.length, unit[0], unit[1])}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
        {items.map((item, i) => (
          <li
            key={item.href}
            className={cn(
              WELL,
              "flex min-w-0 flex-[1_1_240px] flex-col gap-2 px-[18px] pt-4 pb-2.5",
            )}
          >
            <span className="font-mono text-xs text-ink-2">{pad2(i + 1)}</span>
            <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="m-0 text-sm leading-[1.5] text-ink-2">
              {item.description}
            </p>
            <Link href={item.href} className={cn(TEXT_LINK, "mt-auto")}>
              {cta} →
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Hero info chip: a count (or a marker) and what it counts. */
function InfoChip({
  count,
  children,
}: {
  count?: number;
  children: ReactNode;
}) {
  return (
    <li className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-4 text-sm font-medium">
      {count === undefined ? (
        <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
      ) : (
        <span className="font-mono text-mark">{pad2(count)}</span>
      )}
      {children}
    </li>
  );
}

/**
 * Learn (bento redesign, phase 7f; design spec 4.10): the hero, then the
 * topic hubs in the chosen language around the "Read the hubs in" switch,
 * and the operator notes. The language is the `?lang=` search param, owned
 * by the route. Writing (posts) shows only while the blog is public
 * (`BLOG_PUBLIC`); until then nothing here links to /blog.
 */
export default function LearnPage({
  posts,
  lang,
  onLangChange,
}: {
  posts: readonly BlogCard[];
  lang: LearnLang;
  onLangChange: (next: LearnLang) => void;
}) {
  const { headline } = learnPage;
  const hubs = getLearnHubs(lang);
  const writing = getLearnWritingLinks(posts);
  const [first, ...rest] = hubs;

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="flex flex-col items-start gap-6"
      >
        <EyebrowChip>{learnPage.eyebrow}</EyebrowChip>
        <h1 id="hero-title" className="m-0 max-w-[880px] text-title text-ink">
          <span className="text-ink-3">{headline.muted}</span> {headline.rest}{" "}
          <span className="text-mark">{headline.accent}</span>
        </h1>
        <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
          {learnPage.lede}
        </p>
        <ul
          aria-label="On this page"
          className="m-0 flex list-none flex-wrap gap-2.5 p-0"
        >
          <InfoChip count={hubs.length}>Topic hubs</InfoChip>
          {writing.length > 0 ? (
            <InfoChip count={writing.length}>Writing</InfoChip>
          ) : null}
          <InfoChip count={learnOperatorNotes.length}>Operator notes</InfoChip>
          <InfoChip>
            English · <span lang="th">ไทย</span>
          </InfoChip>
        </ul>
      </section>
      <Bento>
        {first ? <HubCard hub={first} index={0} count={hubs.length} /> : null}
        <LanguageCard lang={lang} count={hubs.length} onChange={onLangChange} />
        {rest.map((hub, i) => (
          <HubCard key={hub.slug} hub={hub} index={i + 1} count={hubs.length} />
        ))}
        {writing.length > 0 ? (
          <LinkListCard
            id="card-writing"
            title="Writing"
            unit={["post", "posts"]}
            cta="Read"
            items={writing}
          />
        ) : null}
        <LinkListCard
          id="card-notes"
          title="Operator notes"
          unit={["note", "notes"]}
          cta="Open"
          items={learnOperatorNotes}
        />
      </Bento>
    </>
  );
}
