import { Fragment, type ReactNode, type SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import type { HeadlineLine, PortfolioProject } from "@/lib/content/portfolio";

/*
 * Pieces the portfolio index and project pages share (bento canvas 4.5,
 * 4.6): the hero h1, the canvas's line icons and the access tag.
 */

/** Bento card shell for cards that lay out their own header row. */
export const CARD =
  "relative overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card";

/** Mono uppercase label (12 px, .06em), ink2. */
export const MONO_LABEL = "m-0 font-mono text-label text-ink-2 uppercase";

/**
 * The hero h1: one block per line, muted words in --muted, the last line in
 * the accent. The h1 is the LCP element; its lines only slide (`kj-lines`).
 */
export function HeroTitle({ lines }: { lines: readonly HeadlineLine[] }) {
  return (
    <h1 id="hero-title" className="kj-lines m-0 text-title text-ink">
      {lines.map((line, i) => {
        const accent = i === lines.length - 1;
        return (
          <span
            key={i}
            className={cn("block", accent && lines.length > 1 && "text-mark")}
          >
            {line.map((segment, k) => (
              <Fragment key={k}>
                {k > 0 ? " " : null}
                {segment.muted ? (
                  <span className="text-ink-3">{segment.text}</span>
                ) : (
                  segment.text
                )}
              </Fragment>
            ))}{" "}
          </span>
        );
      })}
    </h1>
  );
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/** A canvas line icon: 24 px grid, round caps, decorative. */
function Line({
  size = 14,
  strokeWidth = 1.8,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Line>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Line>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 21v-4h6v4" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1" />
    </Line>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Line>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Line strokeWidth={2} {...props}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </Line>
  );
}

/** The 10 px down arrow between architecture layers. */
export function ArrowDownSmallIcon(props: IconProps) {
  return (
    <Line size={10} strokeWidth={2.6} {...props}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </Line>
  );
}

const ACCESS_LABEL = {
  internal: "Internal tool",
  public: "Public",
} as const satisfies Record<PortfolioProject["access"], string>;

/** "Internal tool" tag: a tint pill with the accent lock (no border). */
export function AccessTag({ access }: { access: PortfolioProject["access"] }) {
  return (
    <span className="inline-flex min-h-[26px] items-center gap-1.5 rounded-full bg-surface-tint px-2.5 text-xs font-medium text-ink">
      {access === "internal" ? (
        <LockIcon size={12} strokeWidth={2.2} className="shrink-0 text-mark" />
      ) : null}
      {ACCESS_LABEL[access]}
    </span>
  );
}

/** Meta-strip value for the project's access. */
export function accessDetail(access: PortfolioProject["access"]): string {
  return access === "internal" ? "Internal tool (login only)" : "Public";
}
