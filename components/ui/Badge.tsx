import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "default" | "outline" | "inverted";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "sticker",
  outline:
    "inline-flex items-center gap-1.5 border-brutal bg-transparent px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-fg",
  inverted:
    "inline-flex items-center gap-1.5 border-brutal bg-fg px-2.5 py-1 font-mono text-xs uppercase tracking-widest text-bg",
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
