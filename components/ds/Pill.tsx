import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import { cn } from "@/lib/utils/cn";

/*
 * Pill (profile redesign, design spec 6.1): the site's button shape. Dark is
 * the one action a group exists for; ghost is every other. A link when it
 * goes somewhere, a button when it acts. Styles: `.ds-pill*` in globals.css.
 */

type PillSize = "sm" | "md" | "hero" | "nav" | "lg";

interface PillBase {
  /** Visible label. A round pill keeps it for screen readers only. */
  children: ReactNode;
  variant?: "dark" | "ghost";
  /** sm 36, md 44, hero 44 with 16 px text, nav 48, lg 52 (px). */
  size?: PillSize;
  /** Icon-only round pill: `icon` shows and the label names it. */
  round?: boolean;
  /** Decorative icon before the label, or alone in a round pill. */
  icon?: ReactNode;
  /** swap: two arrows that trade places on hover and focus. */
  arrow?: "swap" | "none";
  className?: string;
}

type PillLinkProps = PillBase & {
  href: string;
  /** New tab, with rel="noopener" and a hidden "(opens in a new tab)". */
  external?: boolean;
  onClick?: never;
  type?: never;
};

type PillButtonProps = PillBase & {
  href?: undefined;
  external?: never;
  onClick?: () => void;
  type?: "button" | "submit";
};

export type PillProps = PillLinkProps | PillButtonProps;

const SIZE: Record<PillSize, string | null> = {
  sm: "ds-pill--sm",
  md: null,
  hero: "ds-pill--hero",
  nav: "ds-pill--nav",
  lg: "ds-pill--lg",
};

/** The pill's classes, for a pill drawn inside another link (card CTAs). */
export function pillClass({
  variant = "dark",
  size = "md",
  round = false,
}: Pick<PillBase, "variant" | "size" | "round"> = {}): string {
  return cn(
    "ds-pill",
    variant === "ghost" && "ds-pill--ghost",
    SIZE[size],
    round && "ds-pill--round",
  );
}

/** Two up-right arrows; the first leaves as the second arrives. */
export function SwapArrow() {
  return (
    <span className="ds-swap" aria-hidden="true">
      <ArrowUpRightIcon size={16} />
      <ArrowUpRightIcon size={16} />
    </span>
  );
}

/** A card call to action's arrow: no width until the card is hovered. */
export function CtaArrow() {
  return (
    <span className="ds-cta-arrow" aria-hidden="true">
      <ArrowUpRightIcon size={16} />
    </span>
  );
}

export function Pill(props: PillProps) {
  const { children, round = false, icon, arrow = "none" } = props;
  const className = cn(pillClass(props), props.className);
  // One inline run, so the space before the note survives flex layout and
  // the name reads "GitHub (opens in a new tab)" in every engine.
  const note = props.external ? (
    <>
      {" "}
      <span className="sr-only">(opens in a new tab)</span>
    </>
  ) : null;
  const content = (
    <>
      {icon ? (
        <span className="ds-pill__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={round ? "sr-only" : undefined}>
        {children}
        {note}
      </span>
      {arrow === "swap" && !round ? <SwapArrow /> : null}
    </>
  );

  if (props.href !== undefined) {
    return props.external ? (
      <Link
        href={props.href}
        className={className}
        target="_blank"
        rel="noopener"
      >
        {content}
      </Link>
    ) : (
      <Link href={props.href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type={props.type ?? "button"}
      className={className}
      onClick={props.onClick}
    >
      {content}
    </button>
  );
}
