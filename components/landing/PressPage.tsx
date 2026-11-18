import type { BentoSpan } from "@/components/bento/Bento";
import { CatalogHero } from "@/components/profile/catalog/CatalogHero";
import { ToggleGroup } from "@/components/profile/catalog/ToggleGroup";
import { Headline } from "@/components/profile/pages/PageHero";
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
 * /press (profile redesign Phase 7h, a light restyle of the bento canvas
 * Press). Hidden: noindex and no links from public pages. The hero on the
 * pixel sky, the type filter as toggle pills, and each piece as a tile in
 * the canvas's spans. Banners stay the current images until the owner
 * supplies new ones. Styles: `.pf-press*` in pages-catalog.css.
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
      data-span={span}
      className="ds-tile ds-tile--paper pf-press-card"
    >
      <div className="pf-press-card__head">
        <h2 id={`press-type-${item.id}`} className="t-meta pf-cat-kicker">
          {item.source}
        </h2>
        <time dateTime={item.date} className="t-meta pf-cat-note">
          {formatPressDate(item.date)}
        </time>
      </div>
      <div className="pf-press-card__body">
        <figure className="pf-press-card__banner">
          {/* Eager: four images on a hidden page, and full-page captures
              never catch a lazy one half loaded. */}
          <Image
            src={item.bannerSrc}
            alt={item.bannerAlt}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 400px, 100vw"
          />
          <figcaption className="ds-chip pf-press-card__domain">
            {domain}
          </figcaption>
        </figure>
        <div className="pf-press-card__copy">
          <h3
            id={titleId}
            className={lead ? "t-h3 pf-cat-title" : "t-lift-title pf-cat-title"}
          >
            <a
              href={item.href}
              {...EXTERNAL}
              className="pf-press-card__title-link"
            >
              {item.title}
            </a>
          </h3>
          <p className="t-small pf-cat-note">{item.description}</p>
          <a
            href={item.href}
            {...EXTERNAL}
            className="ds-text-link pf-press-card__view"
          >
            <span>View on {domain}</span>
            <span className="ds-text-link__arrow" aria-hidden="true">
              →
            </span>
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
      <CatalogHero
        eyebrow={pressPage.eyebrow}
        title={
          <Headline
            lines={[
              [
                { text: headline.muted, tone: "muted" },
                { text: headline.middle },
                { text: headline.joiner, tone: "muted" },
              ],
              [{ text: headline.accent, tone: "accent" }],
            ]}
          />
        }
        lead={pressPage.lead}
      />

      <section
        aria-label="Coverage"
        className="ds-wrap pf-cat-section pf-cat-end pf-press"
      >
        <div className="pf-press__bar">
          <ToggleGroup
            label="Filter coverage by type"
            options={options}
            value={type}
            onChange={onTypeChange}
          />
          <p aria-live="polite" className="t-meta pf-cat-note">
            Showing {visible.length} of {pressItems.length}
          </p>
        </div>
        <div className="pf-press__grid">
          {visible.map((item, i) => (
            <PressCard
              key={item.id}
              item={item}
              span={spans[i] ?? 1}
              lead={i === 0}
            />
          ))}
        </div>
      </section>
    </>
  );
}
