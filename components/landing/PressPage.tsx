import {
  Bento,
  CardKicker,
  bentoSpan,
  type BentoSpan,
} from "@/components/bento/Bento";
import { MonoEyebrow } from "@/components/bento/MonoEyebrow";
import { Segmented } from "@/components/bento/Segmented";
import Image from "@/components/ui/Image";
import {
  PRESS_TYPES,
  formatPressDate,
  pressItems,
  pressPage,
  type PressItem,
} from "@/lib/content/press";
import {
  PRESS_FILTERS,
  matchesPressFilter,
  type PressFilter,
} from "@/lib/press/search";

/*
 * /press (bento canvas Press, design spec 4.19). Hidden: noindex and no
 * links from public pages. Banners stay the current images until the owner
 * supplies new ones (spec 6, gap 11).
 */

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Card spans by how many cards show, as the canvas lays them out: 4 as
 * wide-narrow / narrow-wide, 3 as one wide over two, 2 and 1 full width.
 * Longer lists repeat the four-card pattern and close the last row.
 */
export function pressSpans(count: number): BentoSpan[] {
  const canvas: Record<number, BentoSpan[]> = {
    0: [],
    1: [3],
    2: [3, 3],
    3: [3, 1, 1],
    4: [2, 1, 1, 2],
  };
  if (count <= 4) return canvas[count] ?? [];
  const rest = count % 4;
  const tail: BentoSpan[] = rest === 1 ? [3] : rest === 2 ? [2, 1] : [1, 1, 1];
  return [
    ...Array.from({ length: count - rest }, (_, i) => canvas[4]![i % 4]!),
    ...(rest ? tail : []),
  ];
}

function domainOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

function PressCard({
  item,
  span,
  lead,
}: {
  item: PressItem;
  span: BentoSpan;
  /** The first card's title reads a little larger. */
  lead: boolean;
}) {
  const titleId = `press-${item.id}`;
  const domain = domainOf(item.href);
  return (
    <article
      aria-labelledby={titleId}
      className={`relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card ${bentoSpan(span)}`}
    >
      <div className="flex items-center justify-between gap-3">
        <CardKicker id={`press-type-${item.id}`}>{item.source}</CardKicker>
        <time
          dateTime={item.date}
          className="font-mono text-xs tracking-[0.04em] text-ink-2"
        >
          {formatPressDate(item.date)}
        </time>
      </div>
      <div className="flex flex-auto flex-wrap gap-x-5 gap-y-4">
        <figure className="relative m-0 min-h-[180px] min-w-0 flex-[1_1_260px] overflow-hidden rounded-well border border-hairline bg-surface-tint">
          {/* Eager: four images on a hidden page, and full-page captures
              never catch a lazy one half loaded. */}
          <Image
            src={item.bannerSrc}
            alt={item.bannerAlt}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 400px, 100vw"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full border border-hairline bg-surface px-2.5 py-1.5 font-mono text-xs leading-none text-ink-2">
            {domain}
          </figcaption>
        </figure>
        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2.5">
          <h3
            id={titleId}
            className={`m-0 leading-[1.3] font-semibold tracking-[-0.02em] ${lead ? "text-[22px]" : "text-xl"}`}
          >
            <a href={item.href} {...EXTERNAL} className="text-ink no-underline">
              {item.title}
            </a>
          </h3>
          <p className="m-0 text-card leading-[1.55] text-ink-2">
            {item.description}
          </p>
          <a
            href={item.href}
            {...EXTERNAL}
            className="mt-auto inline-flex min-h-11 items-center self-start text-sm font-medium [overflow-wrap:anywhere] no-underline"
          >
            View on {domain} →
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * The press page body. `type` is the typed `?type=` param; the route keeps
 * it in the URL.
 */
export default function PressPage({
  type,
  onTypeChange,
}: {
  type: PressFilter;
  onTypeChange: (next: PressFilter) => void;
}) {
  const { headline } = pressPage;
  const visible = pressItems.filter((item) => matchesPressFilter(item, type));
  const spans = pressSpans(visible.length);
  const options = PRESS_FILTERS.map((value) => {
    const name =
      value === "all"
        ? "All"
        : (PRESS_TYPES.find((t) => t.toLowerCase() === value) ?? value);
    const count = pressItems.filter((item) =>
      matchesPressFilter(item, value),
    ).length;
    return { value, label: `${name} · ${count}` };
  });

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="flex flex-col gap-[22px]"
      >
        <MonoEyebrow>{pressPage.eyebrow}</MonoEyebrow>
        <h1 id="hero-title" className="kj-lines m-0 text-title text-ink">
          <span className="block">
            <span className="text-ink-3">{headline.muted}</span>{" "}
            {headline.middle}{" "}
            <span className="text-ink-3">{headline.joiner}</span>
          </span>{" "}
          <span className="block text-mark">{headline.accent}</span>
        </h1>
        <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
          {pressPage.lead}
        </p>
      </section>

      <section aria-label="Coverage" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <Segmented
            label="Filter coverage by type"
            options={options}
            value={type}
            onChange={(next) => onTypeChange(next as PressFilter)}
            tone="surface"
            className="max-w-full rounded-bento shadow-card"
          />
          <p
            aria-live="polite"
            className="m-0 font-mono text-xs tracking-[0.06em] text-ink-2 uppercase"
          >
            Showing {visible.length} of {pressItems.length}
          </p>
        </div>
        <Bento>
          {visible.map((item, i) => (
            <PressCard
              key={item.id}
              item={item}
              span={spans[i] ?? 1}
              lead={i === 0}
            />
          ))}
        </Bento>
      </section>
    </>
  );
}
