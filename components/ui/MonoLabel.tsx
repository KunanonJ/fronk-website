import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The 12 px uppercase mono eyebrow (visual-redesign Phase 0). Replaces ad-hoc
 * 10-11 px arbitrary-size uppercase eyebrows; never smaller than 12 px.
 */
export function MonoLabel({
  as: As = "p",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <As className={cn("font-mono text-label uppercase text-ink-2", className)}>
      {children}
    </As>
  );
}
