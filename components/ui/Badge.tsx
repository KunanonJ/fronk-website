import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "default" | "outline" | "inverted";

const VARIANTS: Record<BadgeVariant, string> = {
  // All three are hairline mono HUD labels; they differ only in fill/emphasis.
  default: "label-mono border border-border bg-surface-2 px-2.5 py-1 text-fg",
  outline: "label-mono border border-border bg-transparent px-2.5 py-1",
  inverted:
    "inline-flex items-center gap-1.5 border border-fg bg-fg px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-bg",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn(VARIANTS[variant], className)}>{children}</span>;
}
