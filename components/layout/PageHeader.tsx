import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cn("mb-12 max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
      ) : null}
      <h1 className="mt-4 font-display text-4xl font-medium leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-lg text-muted">{description}</p>
      ) : null}
      {meta}
      {children}
    </header>
  );
}
