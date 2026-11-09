import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CardTone = "paper" | "tint" | "warm" | "ink";

/**
 * visual-redesign Phase 0. Large radius, hairline border, soft elevation in
 * light mode (hairline only in dark). `ink` is the inverted card: dark in
 * light mode and Glaze-on-dark text in dark mode stays readable because it
 * uses the same role tokens flipped.
 */
const TONES: Record<CardTone, string> = {
  paper: "bg-surface text-ink",
  tint: "bg-surface-tint text-ink",
  warm: "bg-surface-warm text-ink",
  ink: "bg-ink text-page",
};

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  tone?: CardTone;
  hover?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Card<T extends ElementType = "div">({
  as,
  tone = "paper",
  hover = false,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      data-tone={tone}
      className={cn(
        "rounded-card border border-hairline shadow-card",
        TONES[tone],
        hover &&
          "transition-[border-color,transform] duration-150 ease-smooth hover:border-hairline-strong motion-safe:hover:-translate-y-0.5",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
