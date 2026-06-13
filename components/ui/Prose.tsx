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
        "prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-4xl prose-h2:text-3xl",
        "prose-a:text-fg prose-a:underline prose-a:decoration-2 prose-a:decoration-accent prose-a:underline-offset-4 hover:prose-a:text-accent",
        "prose-code:rounded-none prose-code:border prose-code:border-border prose-code:bg-subtle prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:rounded-none prose-pre:border-brutal prose-pre:bg-subtle",
        "prose-img:rounded-none prose-img:border-brutal",
        "prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:not-italic",
        className,
      )}
    >
      {children}
    </div>
  );
}
