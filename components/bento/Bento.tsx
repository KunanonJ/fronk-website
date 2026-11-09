import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { cn } from "@/lib/utils/cn";

/*
 * Bento grid and cards (bento canvas, design spec 3.5 and 5). Mobile first:
 * one column to 640px, two from 641px, three from 1024px. `span` 2 and 3
 * follow the canvas breakpoints (span 3 becomes 2 between 641 and 1023px).
 * The `bento` class hooks the card stagger and hover lift in globals.css.
 */

/**
 * A redesigned page's <main> (the canvas `.kj-col` body): the 1000 px column,
 * 56 px between the hero and the bento (44 px and 16 px gutters at <=380px).
 * LandingLayout puts the header and footer on the same column.
 */
export function PageMain({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      id="main"
      className={cn(
        "kj mx-auto flex w-full max-w-[1000px] flex-col gap-14 px-6 pt-14 pb-14 max-[381px]:gap-11 max-[381px]:px-4",
        className,
      )}
      {...rest}
    >
      {children}
    </main>
  );
}

export type BentoSpan = 1 | 2 | 3;

const SPAN: Record<BentoSpan, string> = {
  1: "",
  2: "min-[641px]:col-span-2",
  3: "min-[641px]:col-span-2 lg:col-span-3",
};

/** Column-span classes for a card in a `Bento` grid. */
export function bentoSpan(span: BentoSpan): string {
  return SPAN[span];
}

export function Bento({
  dense = false,
  className,
  children,
  ...rest
}: { dense?: boolean } & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "bento grid grid-cols-1 gap-5 min-[641px]:grid-cols-2 lg:grid-cols-3",
        dense && "grid-flow-row-dense",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Two-column variant (`bento-2`): stays two columns from 641px. */
export function BentoPair({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "bento-2 grid grid-cols-1 gap-5 min-[641px]:grid-cols-2",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * A full-width bento cell holding cards side by side in a wrapping flex row
 * (About FAQ + Next, Résumé Skills + Share). The cards size by their
 * `flex` basis, so the row wraps without media queries. The row itself
 * never lifts on hover; its cards do (`bento-row` in globals.css).
 */
export function BentoRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bento-row flex min-w-0 flex-wrap gap-5",
        bentoSpan(3),
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Card heading as the canvas kicker: a 13 px pill on the page colour. */
export function CardKicker({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="m-0 self-start rounded-full border border-hairline bg-page px-3 py-[7px] text-meta leading-none font-medium text-ink"
    >
      {children}
    </h2>
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
        "relative flex flex-col overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card",
        minHeight && "min-h-[290px]",
        GAP[gap],
        bentoSpan(span),
        className,
      )}
      {...rest}
    >
      <CardKicker id={headingId}>{title}</CardKicker>
      {children}
    </article>
  );
}

/**
 * The card's text link ("Résumé →"): 14 px, link colour, 44 px target.
 * `corner` pins it to the bottom right, as on the Experience card.
 */
export function CardLink({
  href,
  corner = false,
  className,
  children,
}: {
  href: string;
  corner?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center text-sm font-medium no-underline",
        corner && "absolute right-5 bottom-4",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Inner well: a borderless-shadow tile on the page colour inside a card. */
export function Well({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-well border border-hairline bg-page p-3.5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
