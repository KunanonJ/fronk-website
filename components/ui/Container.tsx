import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export function Container({
  children,
  size = "lg",
  className,
  as: As = "div",
}: {
  children: ReactNode;
  size?: Size;
  className?: string;
  as?: "div" | "section" | "article" | "main" | "header" | "footer" | "nav";
}) {
  return (
    <As className={cn("mx-auto w-full px-6", SIZES[size], className)}>
      {children}
    </As>
  );
}
