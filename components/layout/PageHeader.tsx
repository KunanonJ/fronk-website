import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
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
      {eyebrow ? <Badge variant="outline">{eyebrow}</Badge> : null}
      <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
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
