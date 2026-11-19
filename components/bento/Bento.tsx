import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { CARD_SURFACE } from "@/components/bento/classes";

/*
 * The bento card (bento canvas, design spec 3.5 and 5), as About's
 * contributions card still uses it, and the column spans its grids used:
 * `span` 2 and 3 follow the canvas breakpoints (span 3 becomes 2 between 641
 * and 1023 px).
 */

export type BentoSpan = 1 | 2 | 3;

/**
 * A card's column span at two columns (641 px) and at three (1024 px), for
 * grids that place cards per breakpoint (topic hubs, portfolio).
 */
export type BentoSpans = { md: 1 | 2; lg: BentoSpan };

const MD_SPAN = { 1: "", 2: "min-[641px]:col-span-2" } as const;
const LG_SPAN = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
} as const;

/**
 * Column-span classes for a card in a bento grid (one column to 640 px).
 * A plain span takes two columns at 641 px when it is wider than one.
 */
export function bentoSpan(span: BentoSpan | BentoSpans): string {
  const { md, lg }: BentoSpans =
    typeof span === "number" ? { md: span === 1 ? 1 : 2, lg: span } : span;
  return lg === md ? MD_SPAN[md] : cn(MD_SPAN[md], LG_SPAN[lg]);
}

/**
 * Card kicker as a 13 px pill on the page colour. `as` keeps it a heading
 * when it names the card, or a paragraph when an h2 below does; `marker`
 * (the square's size and fill classes) puts a square before the text.
 */
function Kicker({
  as: Tag = "h2",
  id,
  marker,
  className,
  children,
}: {
  as?: "h2" | "p";
  id?: string;
  marker?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "m-0 inline-flex items-center gap-2 self-start rounded-full border border-hairline bg-page px-3 py-[7px] text-meta leading-none font-medium text-ink",
        className,
      )}
    >
      {marker ? <span aria-hidden className={cn("shrink-0", marker)} /> : null}
      {children}
    </Tag>
  );
}

const TITLE_SIZE = {
  md: "text-[22px] leading-[1.25] tracking-[-0.02em]",
  lg: "text-[28px] leading-[1.2] tracking-[-0.03em]",
  xl: "text-[40px] leading-[1.1] tracking-[-0.04em]",
} as const;

/** In-card title under the kicker (About, Contact): an h3, 22 px by default. */
export function CardTitle({
  size = "md",
  className,
  children,
}: {
  size?: keyof typeof TITLE_SIZE;
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3 className={cn("m-0 font-semibold", TITLE_SIZE[size], className)}>
      {children}
    </h3>
  );
}

const GAP = {
  0: "",
  2: "gap-2",
  2.5: "gap-2.5",
  3: "gap-3",
  3.5: "gap-3.5",
  4: "gap-4",
  4.5: "gap-[18px]",
} as const;

type BentoCardProps = {
  /** Id of the kicker heading; the card is labelled by it. */
  headingId: string;
  /** Kicker text (the card's h2). */
  title: ReactNode;
  span?: BentoSpan;
  gap?: keyof typeof GAP;
  /** The canvas 290 px floor; cards sized by their content turn it off. */
  minHeight?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"article">, "title" | "className">;

/**
 * Base bento card: an <article> labelled by its kicker h2, 28 px radius,
 * hairline, surface fill, card shadow, 290 px minimum height.
 */
export function BentoCard({
  headingId,
  title,
  span = 1,
  gap = 4,
  minHeight = true,
  className,
  children,
  ...rest
}: BentoCardProps) {
  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        CARD_SURFACE,
        "flex flex-col",
        minHeight && "min-h-[290px]",
        GAP[gap],
        bentoSpan(span),
        className,
      )}
      {...rest}
    >
      <Kicker id={headingId}>{title}</Kicker>
      {children}
    </article>
  );
}
