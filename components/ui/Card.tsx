import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  hover?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Card<T extends ElementType = "div">({
  as,
  hover = false,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "panel",
        hover &&
          "transition-colors duration-150 hover:border-border-strong hover:bg-surface-2",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
