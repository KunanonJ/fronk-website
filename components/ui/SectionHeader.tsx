import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";

export function SectionHeader({
  kicker,
  title,
  description,
  className,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("mb-10 flex items-end justify-between gap-4", className)}>
      <div>
        {kicker ? <Badge variant="outline">{kicker}</Badge> : null}
        <h2 className="mt-3 font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
