import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { cn } from "@/lib/utils/cn";

/*
 * Bento grid and cards (bento canvas, design spec 3.5 and 5). Mobile first:
 * one column to 640px, two from 641px, three from 1024px. `span` 2 and 3
 * follow the canvas breakpoints (span 3 becomes 2 between 641 and 1023px).
 * The `bento` class hooks the card stagger and hover lift in globals.css.
 */

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

const GAP = {
  0: "",
  3: "gap-3",
  3.5: "gap-3.5",
  4: "gap-4",
} as const;

type BentoCardProps = {
  /** Id of the kicker heading; the card is labelled by it. */
  headingId: string;
  /** Kicker text (the card's h2). */
  title: ReactNode;
  span?: BentoSpan;
  gap?: keyof typeof GAP;
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
  className,
  children,
  ...rest
}: BentoCardProps) {
  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "relative flex min-h-[290px] flex-col overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card",
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
