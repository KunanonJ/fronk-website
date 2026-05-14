import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-fg text-bg hover:bg-fg/90",
  secondary:
    "border border-border bg-transparent text-fg hover:bg-subtle",
  ghost: "text-fg hover:bg-subtle",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
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
