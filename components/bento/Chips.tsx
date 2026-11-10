import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * Chips and pills (bento canvas, design spec 3.6). Markers are squares: the
 * accent square marks, the Ember square means live and always sits on the
 * surface fill next to its word.
 */

/** Hero eyebrow: 13 px pill with a 6 px accent square. */
export function EyebrowChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "m-0 inline-flex items-center gap-2 self-start rounded-full border border-hairline-strong bg-surface px-3 py-[7px] text-meta leading-none font-medium text-ink",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
      {children}
    </p>
  );
}

/** "Live" status pill: a pulsing Ember square, "Live", then the status. */
export function LivePill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "m-0 inline-flex items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-4 py-2.5 text-card leading-none font-medium text-ink",
        className,
      )}
    >
      <span aria-hidden className="kj-live size-2 shrink-0 bg-ember" />
      <span>Live</span>
      <span className="text-ink-2">· {status}</span>
    </p>
  );
}

/**
 * Availability pill: the accent square, a label, then the detail in ink-2
 * ("Open to roles · Forward Deployed Engineer and AI engineering · Bangkok
 * or remote"). Unlike the live pill it may wrap: at 375 px it runs to three
 * lines and its corners stay round. The accent square, not Ember: Ember
 * means live or failed.
 */
export function AvailabilityPill({
  label,
  detail,
  className,
}: {
  label: string;
  detail: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "m-0 inline-flex max-w-full items-baseline gap-2.5 rounded-[22px] border border-hairline-strong bg-surface px-4 py-2.5 text-card leading-[1.35] font-medium text-ink",
        className,
      )}
    >
      <span aria-hidden className="size-2 shrink-0 -translate-y-px bg-mark" />
      <span className="min-w-0">
        {label} <span className="text-ink-2">· {detail}</span>
      </span>
    </p>
  );
}

/** Meta tag (26 px): `marked` adds the accent square ("Original"). */
export function MetaTag({
  children,
  marked = false,
  title,
}: {
  children: ReactNode;
  marked?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex min-h-[26px] items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-2.5 text-xs font-medium text-ink"
    >
      {marked ? <span aria-hidden className="size-1.5 bg-mark" /> : null}
      {children}
    </span>
  );
}

/** Tech chip: Geist Mono 12 px on a hairline pill. */
export function TechChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-hairline-strong px-2.5 py-1 font-mono text-xs text-ink-2">
      {children}
    </span>
  );
}
