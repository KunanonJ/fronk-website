import Link from "@/components/navigation/Link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

/*
 * visual-redesign Phase 0. Every size keeps at least a 36 px box (24 px is the
 * WCAG 2.2 minimum target); md and lg are 44 px and 48 px.
 */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans text-sm font-medium tracking-tight transition-[color,background-color,border-color,opacity] duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  /** Signal fill, Paper text (6.6:1). */
  primary:
    "border border-transparent bg-action text-on-action hover:bg-action-hover active:bg-action-hover",
  /** Surface with a hairline. */
  secondary:
    "border border-hairline-strong bg-surface text-ink hover:border-ink/40 hover:bg-surface-tint active:bg-surface-tint",
  /** Link-style text with an underline. */
  ghost:
    "border border-transparent text-ink-2 underline decoration-1 underline-offset-4 hover:text-ink active:text-ink",
  /** Ink fill (Glaze in dark mode): the high-contrast Contact pill. */
  inverse:
    "border border-transparent bg-ink text-page hover:opacity-90 active:opacity-80",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={classes} {...(rest as ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
