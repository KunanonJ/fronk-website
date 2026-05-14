import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-zinc max-w-none",
        "dark:prose-invert",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-subtle prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-subtle",
        "prose-img:rounded-lg prose-img:border prose-img:border-border",
        "prose-blockquote:border-accent",
        className,
      )}
    >
      {children}
    </div>
  );
}
