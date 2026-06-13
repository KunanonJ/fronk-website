import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { CornerTicks } from "@/components/ui/CornerTicks";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "group relative inline-flex items-center justify-center gap-2 border font-mono text-xs uppercase tracking-wider transition-[color,background-color,border-color,transform,box-shadow] duration-150 active:translate-y-px active:[transition-duration:75ms] motion-reduce:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  // Mint is the single earned accent — the primary action wears it as a tinted
  // hairline + text, not a heavy fill, keeping the shell monochrome.
  primary:
    "border-accent/55 text-accent hover:border-accent hover:bg-accent/10 active:bg-accent/15",
  secondary:
    "border-border text-fg hover:border-border-strong hover:bg-surface-2 active:bg-surface-2",
  ghost:
    "border-transparent text-muted underline decoration-1 underline-offset-4 hover:text-fg active:text-accent active:decoration-accent",
};

/** Corner-tick colour per variant (ghost has no ticks). */
const TICK_COLOR: Record<Variant, string | null> = {
  primary: "text-accent/70",
  secondary: "text-border-strong",
  ghost: null,
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-5",
  lg: "h-12 px-6 text-[0.8rem]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);
  const tickColor = TICK_COLOR[variant];
  const ticks = tickColor ? (
    <CornerTicks size={5} className={cn("tick-armed", tickColor)} />
  ) : null;

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as ComponentProps<typeof Link>)}>
        {ticks}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {ticks}
      {children}
    </button>
  );
}
