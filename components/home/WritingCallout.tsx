import Link from "next/link";
import { ArrowDownRightIcon } from "@/components/icons";
import type { CtaLink } from "@/lib/sanity/types";

interface WritingCalloutProps {
  eyebrow?: string;
  title: string;
  description: string;
  cta: CtaLink;
}

export function WritingCallout({
  eyebrow,
  title,
  description,
  cta,
}: WritingCalloutProps) {
  return (
    <div className="flex flex-col items-start gap-6 border-t border-border pt-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-muted">{description}</p>
      </div>
      <Link
        href={cta.href}
        className="inline-flex shrink-0 items-center gap-2 text-sm text-fg transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {cta.label}
        <ArrowDownRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
